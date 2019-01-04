const express = require('express');
const verifyRoute = express.Router({mergeParams: true});

const userController = require('../controllers/userController');

verifyRoute.route('/')
    .post(userController.verifyUser);

module.exports = verifyRoute;