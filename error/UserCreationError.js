const ApplicationError = require('./ApplicationError');

module.exports = class UserCreationError extends ApplicationError {
    constructor(message) {
      super(message, 500);
    }
  };