const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const giveToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TOKEN_VALID_FOR,
  });
};

const SendToken = (user, statusCode, res) => {
  const token = giveToken(user._id);

  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: false,
    httpOnly: true,
  };
  user.password = undefined;
  res.cookie('jwt', token, cookieOption);
  res.status(statusCode).json({
    token,
    user,
  });
};

// SignUP User
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  SendToken(newUser, 200, res);
});

// Login User
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) if email and password exist in the req
  if (!email || !password) {
    return next(new AppError('Empty Email or Password..!!!!!!!!', 401));
  }

  // 2) check if email and password is coorect
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password..!!!!!!!', 401));
  }

  // 3) if OK give token
  SendToken(user, 200, res);
});

// check Token
exports.checkToken = catchAsync(async (req, res, next) => {
  // 1) Getting the token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('please login first to see All Tours....!!!!!!', 401)
    );
  }

  // 2) Verification Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if User still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('the User belonging to this token is not Exist .....!')
    );
  }

  // 4) check if the user change password after after the token was granted
  if (currentUser.isPasswordChangedAfterToken(decoded.iat)) {
    return next(
      new AppError(
        'Password Changed After this Token, so you should login again with the new Password......',
        401
      )
    );
  }
  req.user = currentUser;

  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// check permissions
exports.checkPermissions = (...roles) => {
  return (req, res, next) => {
    // check role
    console.log(req.user.role);
    if (false /*roles.includes(req.user.role)*/) {
      next(
        new AppError('you do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// forget Password
exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1) get email and check if exist
  const email = req.body.email;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('ther is no user with this Email', 404));
  }

  // 2) create rest token
  const restPasswordToken = user.createForgetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // 3) send rest password token to user
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${restPasswordToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token (valid for 10 min)',
    //   message,
    // });

    res.status(200).json({
      status: 'success',
      restPasswordToken,
      //message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordRestToken = undefined;
    user.passwordRestExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(err);
  }
});

// rest Password
exports.restPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on token
  const passwordToken = req.params.token;
  const hashedPasswordToken = crypto
    .createHash('sha256')
    .update(passwordToken)
    .digest('hex');

  const user = await User.findOne({
    passwordRestToken: hashedPasswordToken,
    passwordRestExpires: { $gt: Date.now() },
  });
  // 2) if token is valid and token time not expires? set new password
  if (!user) {
    return next(new AppError('your reset password token not valid', 403));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordRestToken = undefined;
  user.passwordRestExpires = undefined;
  await user.save();

  // 3) log the user in, send JWT
  SendToken(user, 200, res);
});

//Update Current User password

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get user
  const currentUser = await User.findById(req.user._id).select('+password');

  // 2) check if current password is correct
  if (
    !req.body.currentPassword ||
    !req.body.newPassword ||
    !req.body.confirmPassword
  ) {
    return next(
      new AppError(
        ' you should send your current Password and New Password...!'
      ),
      401
    );
  }

  // check if Current Password that user sent IS CORRECT
  const { currentPassword } = req.body;
  if (
    !(await currentUser.checkPassword(currentPassword, currentUser.password))
  ) {
    return next(new AppError(' your current password is wrong .....!!!', 401));
  }

  // 3) if so, Update password
  currentUser.password = req.body.newPassword;
  currentUser.confirmPassword = req.body.confirmPassword;
  await currentUser.save();

  // 4) log user in, send JWT
  SendToken(currentUser, 200, res);
});
