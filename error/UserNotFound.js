const ApplicationError = require('./ApplicationError');

module.exports = class UserNotFound extends ApplicationError {
    constructor(message) {
      super(message, 404);
    }
  };