const uuid = require('uuid');
const validator = require('validator');
const _ = require('lodash');

const dynamoDb = require('../db/dynamodb');

const USERS_TABLE = process.env.USERS_TABLE;

exports.IsAdminUser = async (accountId,userId) => {
  console.log(`|==> Entering in IsAdminUser() with ${userId} & ${accountId}`);
  let isAdmin = false;
  try {
    const params = {
      TableName: USERS_TABLE,
      FilterExpression: "#userId = :userId AND contains (#accountIds,:accountId)",
      ExpressionAttributeNames: {
        "#userId": "id",
        "#accountIds": "accountIds"
      },
      ExpressionAttributeValues: {
        ":userId": userId,
        ":accountId": accountId
      }
    };
    const data = await dynamoDb.scan(params).promise();
    console.log('LastEvaluatedKey =>', data.LastEvaluatedKey);
    data.Items.forEach((item) => {
      console.log('User =>:',item);
      if (item.role === 'owner' || item.role === 'admin') {
        isAdmin = true;
      }
    });
    return isAdmin;
  } catch (error) {
    throw new Error(`Could not fetch: ${error.stack}`);
  }
};