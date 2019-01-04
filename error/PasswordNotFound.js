const ApplicationError = require('./ApplicationError');

module.exports = class PasswordNotFound extends ApplicationError {
    constructor(message) {
      super(message, 400);
    }
  };