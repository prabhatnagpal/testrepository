const express = require('express');
const userRoute = express.Router({mergeParams: true});


const userController = require('../controllers/userController');


userRoute.route('/')
        .post(userController.registerUser);

userRoute.route('/:id')
         .get( userController.getUser);

userRoute.route('/:id/join')
         .put( userController.addUserToHomexAccount);

userRoute.route('/:id/profile')
         .put( userController.userDetails);

userRoute.route('/:id/interest')
         .get( userController.getuserInterest)
         .post(userController.addUserInterest);

userRoute.route('/isconfirmed')
         .post(userController.isUserConfirm);

userRoute.route('/resetpasswordcode')
         .post(userController.resetPasswordVerificationCode);

userRoute.route('/resetpassword')
         .post(userController.resetPassword);

userRoute.route('/resendconfirmation')
         .post(userController.resendConfirmation);

userRoute.route('/:id/refreshtoken')
         .post(userController.refreshtoken);

module.exports = userRoute;