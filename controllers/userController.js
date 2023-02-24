const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// filter fields out from Object
const filterObj = (obj, ...acceptedFields) => {
  const newobj = {};
  Object.keys(obj).forEach((el) => {
    if (acceptedFields.includes(el)) newobj[el] = obj[el];
  });
  return newobj;
};

// Update Currently login user data, but not passowrd
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) create error if user send his passowrd or confirm password
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'this method to update your normal data not password...!',
        401
      )
    );
  }

  // 2) filter fields from req.body
  const filterfields = filterObj(req.body, 'name', 'email');
  // 3) update user data
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterfields, {
    new: true,
    runValidators: true,
  });

  res.status(500).json({
    status: 'error',
    updatedUser,
  });
});

// Delete currently login user (Inactive user)
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
//for admin
exports.createUser = factory.createOne(User);
exports.deleteUser = factory.deleteOne(User);
//not to update user's password
exports.updateUser = factory.updateOne(User);
