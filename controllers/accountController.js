const uuid = require('uuid');
const validator = require('validator');
const _ = require('lodash');

const dynamoDb = require('../db/dynamodb');

const ACCOUNT_TABLE = process.env.ACCOUNT_TABLE;
const USERS_TABLE = process.env.USERS_TABLE;

//Custom Error imports
const EmailIdNotFound = require('../error/EmailIdNotFound');
const SerialNumberNotFound = require('../error/SerialNumberNotFound');
const AddressNotFound = require('../error/AddressNotFound');

module.exports.registerAccount = (req, res) => {
    console.log('>>>registerAccount');
    const timestamp = new Date().toISOString();
    const data = req.body;
    // Request Validation
    if (_.isEmpty(data.emailId)) {
        throw new EmailIdNotFound(req.t('EmailIdNotFound'));
    } else if (!validator.isEmail(data.emailId)) {
        throw new EmailIdNotFound(req.t('WrongFormattedEmailId'));
    } else if (_.isEmpty(data.deviceSerialNumber)) {
        throw new SerialNumberNotFound(req.t('SerialNumberNotFound'));
    } else if (_.isEmpty(data.address) || _.isEmpty(data.city) || _.isEmpty(data.state) ||
        _.isEmpty(data.country) || _.isEmpty(data.zip)) {
        throw new AddressNotFound(req.t('AddressNotFound'));
    } else {
        console.log('request verified');
        const params = {
            TableName: ACCOUNT_TABLE,
            Item: {
                id: uuid.v1(),
                emailId: data.emailId,
                homexName: data.homexName || 'MyHomex',
                deviceSerialNumber: data.deviceSerialNumber,
                address: data.address,
                country: data.country,
                state: data.state,
                city: data.city,
                zip: data.zip,
                isActive: true,
                createdAt: timestamp,
                updatedAt: timestamp
            }
        };
        const account = {
            "id": params.Item.id,
            'emailId': params.Item.emailId,
            "homexName": params.Item.homexName,
            "deviceSerialNumber": params.Item.deviceSerialNumber,
            "address": params.Item.address,
            "city": params.Item.city,
            "state": params.Item.state,
            "country": params.Item.country,
            "zip": params.Item.zip,
            "isActive": true,
            "createdAt": params.Item.createdAt,
            "updatedAt": params.Item.updatedAt
        };

        console.log('account >> ', account);
        console.log('adding data to dynamodb');
        dynamoDb.put(params, (error, result) => {
            if (error) {
                console.error(error);
                res.status(400).json({
                    errorcode: 'AccountCreationError',
                    errormessage: req.t('AccountCreationError')
                });
            } else {
                console.log('|| >> Entering linkUsertoAccount with accountId :', account.id);
                const timestamp = new Date().toISOString();
                const params = {
                    TableName: USERS_TABLE,
                    Key: {
                        "userName": account.emailId
                    },
                    UpdateExpression: "set #attrName = list_append(#attrName, :attrValue)",
                    ExpressionAttributeNames: {
                        "#attrName": "accountIds"
                    },
                    ExpressionAttributeValues: {
                        ":attrValue": [account.id]
                    },
                    ReturnValues: "UPDATED_NEW"
                };
                console.log('|| >> appending accountId to user =>> params :', params);
                dynamoDb.update(params, function (err, data) {
                    if (err) {
                        console.log(err);
                        res.status(400).json({
                            success: false,
                            message: 'Exception occured while linking accountId with User,Account is created but not linked with user'
                        });
                    } else {
                        console.log("success =>",data);
                        res.status(200).json({
                            success: true,
                            account: account
                        });

                    }
                });
            }
        });
    }
};


module.exports.getAccount = (req, res) => {
    console.log('>>>getAccount', req);
    const accountId = req.params.id;
    console.log('accountId==>' + accountId);
    var params = {
        TableName: ACCOUNT_TABLE,
        KeyConditionExpression: "#id = :accountId",
        ExpressionAttributeNames: {
            "#id": "id"
        },
        ExpressionAttributeValues: {
            ":accountId": accountId
        }
    };

    dynamoDb.query(params, (error, result) => {
        if (error) {
            console.error("Unable to query. Error:", JSON.stringify(error, null, 2));
            res.status(400).json({
                errorcode: 'AccountNotFound',
                errormessage: req.t('AccountNotFound')
            });
        } else {
            console.log("Query succeeded.");
            console.log("Query succeeded." + JSON.stringify(result));
            result.Items.forEach(function (item) {
                console.log(" Item :: ", JSON.stringify(item));
            });
            res.status(200).json({
                success: true,
                account: result.Items
            });
        }
    });
};

module.exports.updateAccount = (req, res) => {
    console.log('>>>updateAccount');
    const timestamp = new Date().toISOString();
    console.log(req);
    const data = req.body;
    const id = req.params.id;
    console.log(data);
    if (_.isEmpty(data.deviceSerialNumber)) {
        throw new SerialNumberNotFound(req.t('SerialNumberNotFound'));
    } else {
        const params = {
            TableName: ACCOUNT_TABLE,
            Key: {
                id: id
            },
            UpdateExpression: "set deviceSerialNumber = :deviceSerialNumber",
            ExpressionAttributeValues: {
                ":deviceSerialNumber": data.deviceSerialNumber
            },
            ReturnValues: "UPDATED_NEW"
        };

        console.log('adding data to dynamodb');
        dynamoDb.update(params, (error, result) => {
            if (error) {
                console.error(error);
                res.status(400).json({
                    errorcode: 'AccountNotFound',
                    errormessage: req.t('AccountNotFound')
                });
            }
            if (result) {
                console.log('result', JSON.stringify(result));
            }
            res.status(200).json({
                success: true,
                message: "succesfully updated"
            });
        });
    }
};