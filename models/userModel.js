const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'your account must have a name'],
    trim: true,
    min: 5,
    max: 40,
  },
  email: {
    type: String,
    required: [true, ' please give us your email'],
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, ' make a password for your accont '],
    trim: true,
    minlength: [3, 'password must be above 8 characters'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'passwords are not the same ',
    },
  },
  photo: {
    type: String,
    trim: true,
    default: null,
  },
  changePasswordAt: Date,
  passwordRestToken: String,
  passwordRestExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.changePasswordAt = Date.now() - 1000;
  next();
});

// only work on CREATE and SAVE
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});

userSchema.methods.checkPassword = async (rowPassword, encryptedPassword) => {
  return await bcrypt.compare(rowPassword, encryptedPassword);
};

userSchema.methods.isPasswordChangedAfterToken = function (JWT_iat_time) {
  if (this.changePasswordAt) {
    const passwordTime_in_milliseconds = parseInt(
      this.changePasswordAt.getTime() / 1000,
      10
    );
    return passwordTime_in_milliseconds > JWT_iat_time;
  }
  return false;
};

userSchema.methods.createForgetPasswordToken = function () {
  const randomToken = crypto.randomBytes(32).toString('hex');

  this.passwordRestToken = crypto
    .createHash('sha256')
    .update(randomToken)
    .digest('hex');

  this.passwordRestExpires = Date.now() + 10 * 60 * 1000;

  //console.log(randomToken, this.passwordRestToken, this.passwordRestExpires);
  return randomToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
