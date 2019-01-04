const ApplicationError = require('./ApplicationError');

module.exports = class SerialNumberNotFound extends ApplicationError {
    constructor(message) {
      super(message, 400);
    }
  };