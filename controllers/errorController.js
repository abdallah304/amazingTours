const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicated Field " ${err.keyValue.name} " , pls use anther value`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const validationErrors = Object.values(err.errors).map((el) => el.message);
  const message = `tour missing field => ${validationErrors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = () => {
  return new AppError(' your Token Is Invalid, please login again', 401);
};
const handleTokenExpiredError = () => {
  return new AppError(' your Token Is Expired, please login  again', 401);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.statusCode,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  // Opertional Errors
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
    });
  }
  //Programming or other  Unkown Errors
  else {
    console.error('Programming Error in Production ENV', err);
    res.status(500).json({
      status: 'Error',
      message: 'Something Went Wrong!!!!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleTokenExpiredError();

    sendErrorProd(error, res);
  }
  next();
};
