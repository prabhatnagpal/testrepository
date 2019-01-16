const express = require('express');
const accountRoute = express.Router({mergeParams: true});

const accountController = require('../controllers/accountController');
const userController = require('../controllers/userController');



accountRoute.route('/')
    .post(accountController.registerAccount);

accountRoute.route('/:id')
    .get(accountController.getAccount)
    .put(accountController.updateAccount);

accountRoute.route('/:id/user')
    .get(userController.getUserByAccount);


module.exports = accountRoute;