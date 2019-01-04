module.exports = class ApplicationError extends Error {
    constructor(message, status) {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.ErrorCode = this.constructor.name;
        console.error(`|| ApplicationError errorCode >> ${this.ErrorCode}`);
        this.message = message ||
            'Something went wrong. Please try again.';
        this.status = status || 500;
        console.error(`status : ${this.status}`);
    }
};