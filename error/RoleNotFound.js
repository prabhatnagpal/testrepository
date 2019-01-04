const ApplicationError = require('./ApplicationError');

module.exports = class RoleNotFound extends ApplicationError {
    constructor(message) {
      super(message, 400);
    }
  };