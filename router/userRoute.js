const express = require('express');
const userRoute = express.Router({mergeParams: true});


const userController = require('../controllers/userController');


userRoute.route('/')
        .post(userController.registerUser);

userRoute.route('/:username')
         .get( userController.getUser)
         .put( userController.updateEmail);


userRoute.route('/isconfirmed')
         .post(userController.isUserConfirm);

userRoute.route('/resetpasswordcode')
         .post(userController.resetPasswordVerificationCode);

userRoute.route('/resetpassword')
         .post(userController.resetPassword);

userRoute.route('/resendconfirmation')
         .post(userController.resendConfirmation);

userRoute.route('/:username/refreshtoken')
         .get(userController.refreshtoken);

module.exports = userRoute;