const ApplicationError = require('./ApplicationError');

module.exports = class VerifyUserError extends ApplicationError {
    constructor(message) {
      super(message, 400);
    }
  };