const ApplicationError = require('./ApplicationError');

module.exports = class PanelAdditionError extends ApplicationError {
    constructor(message) {
      super(message, 400);
    }
  };