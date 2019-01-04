const uuid = require('uuid');
const _ = require('lodash');

const dynamoDb = require('../db/dynamodb');

const INTERESTS_TABLE = process.env.INTERESTS_TABLE;


module.exports.addInterestMetadata = (req, res) => {
  console.log('>>>addInterest');
  const timestamp = new Date().toISOString();
  const data = req.body;
  // Request Validation
  if (_.isEmpty(data.interests)) {
    return res.status(400).json({
      errorcode: 'INTERESTNOTFOUND',
      errormessage: req.t('INTERESTNOTFOUND')
    });
  } else if (_.isEmpty(data.category)){
    return res.status(400).json({
      errorcode: 'INTERESTCATEGORYNOTFOUND',
      errormessage: req.t('INTERESTCATEGORYNOTFOUND')
    });
  }else {
    console.log('request verified');
    const interestArray = [];

    data.interests.forEach( function(item){
      const interestdata = { 
        "name": item
      };
      interestArray.push(interestdata);
    });
    
    const params = {
      TableName: INTERESTS_TABLE,
      Item: {
        id: uuid.v1(),
        category: data.category,
        interests: interestArray,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    };
    const interest = {
      "id": params.Item.id,
      "category": params.Item.category,
      'interest': params.Item.interests,
      "createdAt": params.Item.createdAt,
      "updatedAt": params.Item.updatedAt
    };

    console.log('interest >> ', interest);
    console.log('adding data to dynamodb');
    dynamoDb.put(params, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(400).json({
          errorcode: 'interestCreationError',
          errormessage: req.t('interestCreationError')
        });
      } else {
        return res.status(200).json({
          success: true,
          interest
        });
      }
    });
  }
};


module.exports.getInterests = (req, res) => {
  console.log('>>>getInterests', req);

  const params = {
    TableName: INTERESTS_TABLE,
  };

  dynamoDb.scan(params, onScan);
  let count = 0;

  function onScan(err, data) {
    let interests = [];
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      return res.status(404).json({
        errorcode: 'InterestNotFound',
        errormessage: req.t('InterestNotFound')
      });
    } else {
      console.log("Scan succeeded.");
      data.Items.forEach(function (itemdata) {
        console.log("Item :", ++count, JSON.stringify(itemdata));
        interests.push(itemdata);
      });
      // continue scanning if we have more items
      if (typeof data.LastEvaluatedKey != "undefined") {
        console.log("Scanning for more...");
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      } else {
        return res.status(200).json({
          success: true,
          interests
        });
      }
    }
  }
};