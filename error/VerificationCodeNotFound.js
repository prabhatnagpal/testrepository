const ApplicationError = require('./ApplicationError');

module.exports = class VerificationCodeNotFound extends ApplicationError {
    constructor(message) {
      super(message, 400);
    }
  };