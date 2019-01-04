const ApplicationError = require('./ApplicationError');

module.exports = class UserNameAlreadyExists extends ApplicationError {
    constructor(message) {
      super(message, 500);
    }
  };