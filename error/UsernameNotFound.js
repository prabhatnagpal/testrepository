const ApplicationError = require('./ApplicationError');

module.exports = class UsernameNotFound extends ApplicationError {
    constructor(message) {
      super(message, 400);
    }
  };