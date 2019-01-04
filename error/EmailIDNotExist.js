const ApplicationError = require('./ApplicationError');

module.exports = class EmailIDNotExist extends ApplicationError {
    constructor(message) {
      super(message, 401);
    }
  };