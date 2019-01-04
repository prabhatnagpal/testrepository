const ApplicationError = require('./ApplicationError');

module.exports = class EmailIdNotFound extends ApplicationError {
    constructor(message) {
      super(message, 400);
    }
  };