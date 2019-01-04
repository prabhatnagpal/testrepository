const express = require('express');
const indexRoute = express.Router({mergeParams: true});

const userRoute = require('./userRoute');
const accountRoute = require('./accountRoute');
const panelRoute = require('./panelRoute');
//const authRoute = require('./authRoute');
const verifyRoute = require('./verifyRoute');
const interestRoute = require('./interestRoute');
const checkAndLogRequest = require('../middleware/helper');
const authController = require('../controllers/authController');

// middleware that is specific to this router
indexRoute.use(function timeLog(req, res, next) {
    console.log('Time: ', new Date().toISOString());
    console.log(`${req.ip} tried to reach ${req.originalUrl}`);
    next();
});
indexRoute.use(checkAndLogRequest.checkAndLogRequest);

indexRoute.use('/user', userRoute);
indexRoute.use('/account', accountRoute);
indexRoute.use('/homexpanel', panelRoute);
indexRoute.use('/login', authController.login);
indexRoute.use('/logout', authController.logout);
indexRoute.use('/verify', verifyRoute);
indexRoute.use('/interest', interestRoute);

module.exports = indexRoute;