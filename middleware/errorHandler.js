
module.exports.errorHandler = (err, req, res, next) => {
    console.error(`errorHandler  errormessage ||>> ${err.message}`);
    console.error(` errorHandler errorCode ||>> ${err}`);
    err.statusCode = err.status || 500;
    // All HTTP requests must have a response, so let's send back an error with its status code and message
    res.status(err.statusCode).send({
      errorcode: err.ErrorCode || "UnknownError",
      errormessage: err.message
    });
  };