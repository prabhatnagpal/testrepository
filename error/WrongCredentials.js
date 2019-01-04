const ApplicationError = require('./ApplicationError');

module.exports = class WrongCredentials extends ApplicationError {
    constructor(message) {
      super(message, 401);
    }
  };