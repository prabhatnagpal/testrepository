const ApplicationError = require('./ApplicationError');

module.exports = class FirstNameNotFound extends ApplicationError {
    constructor(message) {
      super(message, 400);
    }
  };