const ApplicationError = require('./ApplicationError');

module.exports = class AccountNotFound extends ApplicationError {
    constructor(message) {
      super(message, 400);
    }
  };