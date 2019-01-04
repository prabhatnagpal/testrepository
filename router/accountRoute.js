const express = require('express');
const accountRoute = express.Router({mergeParams: true});

const accountController = require('../controllers/accountController');
const userController = require('../controllers/userController');
const panelController = require('../controllers/panelController');



accountRoute.route('/')
    .post(accountController.registerAccount);

accountRoute.route('/:id')
    .get(accountController.getAccount)
    .put(accountController.updateAccount);

accountRoute.route('/:id/user')
    .get(userController.getUserByAccount);

accountRoute.route('/:id/homexpanel')
    .get(panelController.listAllSlavepanelbyAccount);
accountRoute.route('/:id/homexpanel/:panelId')
    .put(panelController.disableSlavePanel);


module.exports = accountRoute;