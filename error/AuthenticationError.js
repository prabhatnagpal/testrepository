const ApplicationError = require('./ApplicationError');

module.exports = class AuthenticationError extends ApplicationError {
    constructor(message) {
      super(message, 401);
    }
  };