const express = require('express');
const authcontroller = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router.use(authcontroller.checkToken);
router
  .route('/')
  .get(authcontroller.checkPermissions('admin'), reviewController.getAllReviews)
  .post(
    authcontroller.checkPermissions('user'),
    reviewController.addUserIdANDTourId,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authcontroller.checkPermissions('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authcontroller.checkPermissions('user', 'admin'),
    reviewController.updateReview
  );
module.exports = router;
