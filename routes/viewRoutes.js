const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();
// Global middleWare
router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);
router.get('/me', viewsController.getAccount);

router.post(
  '/submit-user-data',
  authController.checkToken,
  viewsController.updateUserData
);

module.exports = router;
