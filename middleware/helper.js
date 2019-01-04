const uuid = require('uuid');
const dynamoDb = require('../db/dynamodb');
const accessLogTable = process.env.ACCESS_LOG_TABLE;

module.exports.checkAndLogRequest = async (req, res, next) => {
    console.log('Checking and logging request');
    try {
        const timestamp = new Date().toISOString();
        console.log(`${req.ip} tried to reach ${req.originalUrl}`);
        const params = {
            TableName: accessLogTable,
            Item: {
                id: uuid.v1(),
                requestedIP: req.ip,
                requestedResource: req.originalUrl,
                requestMethod: req.method,
                createdAt: timestamp,
                updatedAt: timestamp
            }
        };
        console.log('Logging the access request to db');
        dynamoDb.put(params, (error, result) => {
            if (error) {
                console.error(error);
            }
            console.log('request logged to db Successfully');
        });
        next();
    } catch (err) {
        console.error(err);
        next();
    }
};