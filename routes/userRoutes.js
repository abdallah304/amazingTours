const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);
router.route('/forgetpassword').post(authController.forgetPassword);
router.route('/resetPassword/:token').patch(authController.restPassword);

// login middleware
router.use(authController.checkToken);
router.route('/updatepassword').patch(authController.updatePassword);
router.route('/getMe').get(userController.getMe, userController.getUser);
router.route('/updateMe').patch(userController.updateMe);
router.route('/deleteMe').delete(userController.deleteMe);

// permissions middleware
router.use(authController.checkPermissions('admin'));
router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.deleteUser);
//.delete(userController.deleteUser);

module.exports = router;
