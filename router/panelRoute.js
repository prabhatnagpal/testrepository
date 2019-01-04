const express = require('express');
const panelRoute = express.Router({ mergeParams: true });

const panelController = require('../controllers/panelController');

panelRoute.route('/')
    .post(panelController.addhomexPanel);

panelRoute.route('/:id')
    .put(panelController.removeSlavehomexPanel);


module.exports = panelRoute;