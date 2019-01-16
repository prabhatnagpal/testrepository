const express = require('express');
const authRoute = express.Router({ mergeParams: true });

const authController = require('../controllers/authController');


authRoute.route('/')
    .post(authController.login);


module.exports = authRoute;