const ApplicationError = require('./ApplicationError');

module.exports = class RefreshToken extends ApplicationError {
    constructor(message) {
      super(message, 400);
    }
  };