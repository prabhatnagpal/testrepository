const interestRoute = require('express').Router({mergeParams: true});

const interestsController = require('../controllers/interestsController');


interestRoute.route('/')
    .post(interestsController.addInterestMetadata)
    .get(interestsController.getInterests);





module.exports = interestRoute;