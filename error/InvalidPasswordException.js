const ApplicationError = require('./ApplicationError');

module.exports = class InvalidPasswordException extends ApplicationError {
    constructor(message) {
      super(message, 400);
    }
  };