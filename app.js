'use strict';

const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const i18next = require("i18next");
const i18nextMiddleware = require("i18next-express-middleware");
const Backend = require('i18next-node-fs-backend');
const helmet = require('helmet');


const indexRoute = require('./router/indexRoute');
const errHandlerMiddleware = require('./middleware/errorHandler');

const app = express();


i18next.use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json',
      addPath: __dirname + '/locales/{{lng}}/{{ns}}.missing.json'
    },
    fallbackLng: 'en-US',
    preload: ['en', 'ja'],
    saveMissing: true
  });

// Localization middleware
app.use(i18nextMiddleware.handle(i18next));


// Use cors
app.use(cors());
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, PUT');
  next();
});

app.use(helmet());

app.get('/', (req, res, next) => {
  console.error(`${req.ip} tried to reach ${req.originalUrl}`);
  let err = new Error(`${req.ip} tried to reach ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
});

// ToDo 
// API token management functions
app.use('/v1', indexRoute);

//this should be last statement before export app
app.use(errHandlerMiddleware.errorHandler);
module.exports = app;