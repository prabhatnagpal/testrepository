const ApplicationError = require('./ApplicationError');

module.exports = class AddressNotFound extends ApplicationError {
    constructor(message) {
      super(message, 400);
    }
  };