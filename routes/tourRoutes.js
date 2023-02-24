const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// Core Routes
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.checkToken,
    authController.checkPermissions('admin'),
    tourController.createTour
  );

// is there is params ID
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.checkToken,
    authController.checkPermissions('admin'),
    tourController.updateTour
  )
  .delete(
    authController.checkToken,
    authController.checkPermissions('admin'),
    tourController.deleteTour
  );

// get five cheapest tours using Aggregration
router
  .route('/top-5-cheapest-tours')
  .get(tourController.aliasTopCheapest, tourController.getAllTours);

// only admin can perform this actions, so it check permision middleware
router.use(authController.checkToken, authController.checkPermissions('admin'));
router.route('/toursAggregation').get(tourController.getTourStats);
router.route('/toursPlan/:year').get(tourController.getToursPlan);

// for Geospatial maps
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

// rederct to review router
router.use('/:id/reviews', reviewRouter);

module.exports = router;
