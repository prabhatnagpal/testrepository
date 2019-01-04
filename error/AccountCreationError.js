const ApplicationError = require('./ApplicationError');

module.exports = class AccountCreationError extends ApplicationError {
    constructor(message) {
      super(message, 500);
    }
  };