const AWS = require('aws-sdk');

const config = require('../config/aws.json');

const dynamoDb = new AWS.DynamoDB.DocumentClient({
  api_version: '2012-08-10',
  region: config.aws.region
});


module.exports = dynamoDb;