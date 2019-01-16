const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const config = require('../config/aws.json');

AWS.config.update({
    region: config.aws.region
  });


  module.exports= dynamoDb;