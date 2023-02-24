const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.addUserIdANDTourId = (req, res, next) => {
  //check if body  missing required fields
  if (!req.body.review || !req.body.rating) {
    return next(new AppError('Review must contain a text and rating', 401));
  }
  // get user ID and tour ID into the newReview body
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.id;
  next();
};

exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
// all review for specific tour OR all reviews for all tours (nested get route)
exports.getAllReviews = factory.getAll(Review);
