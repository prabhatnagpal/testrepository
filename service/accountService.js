const uuid = require('uuid');
const validator = require('validator');
const _ = require('lodash');

const dynamoDb = require('../db/dynamodb');

const ACCOUNT_TABLE = process.env.ACCOUNT_TABLE;


exports.getAccount = async (accountId) => {
  console.log(`>>> Entering getAccountById() with ${accountId}`);
  try {
    const params = {
      TableName: ACCOUNT_TABLE,
      KeyConditionExpression: "#accountId = :accountId",
      ExpressionAttributeNames: {
        "#accountId": "id"
      },
      ExpressionAttributeValues: {
        ":accountId": accountId
      }
    };
    console.log('params', params);
    const data = await dynamoDb.query(params).promise();
    console.log(`homexPanel==> ${JSON.stringify(...data.Items)}`);
    return data;
  } catch (errDB) {
    throw new Error(`Could not fetch: ${errDB.stack}`);
  }
};