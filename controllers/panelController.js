const uuid = require('uuid');
const _ = require('lodash');

const dynamoDb = require('../db/dynamodb');
const accountService = require ('../service/accountService');
const PANEL_TABLE = process.env.PANEL_TABLE;
//Custom Error imports
const SerialNumberNotFound = require('../error/SerialNumberNotFound');
const AccountNotFound = require('../error/AccountNotFound');


async function getDeviceByDeviceId(deviceId) {
    console.log(`>>> Entering getDeviceByDeviceId() with ${deviceId}`);
    try {
        const params = {
            TableName: PANEL_TABLE,
            KeyConditionExpression: "#deviceId = :deviceId",
            ExpressionAttributeNames: {
                "#deviceId": "id"
            },
            ExpressionAttributeValues: {
                ":deviceId": deviceId
            }
        };
        console.log('params',params);
        const data = await dynamoDb.query(params).promise();
        console.log(`homexPanel==> ${JSON.stringify(data)}`);
        console.log(`homexPanel==> ${JSON.stringify(...data.Items)}`);
        return  JSON.stringify(...data.Items);
    } catch (errDB) {
        throw new Error(`Could not fetch: ${errDB.stack}`);
    }
};

async function isDeviceSerialExist(deviceSerialNumber) {
    console.log(`>>> Entering isDeviceSerialExist() with ${deviceSerialNumber}`);
    try {
        const params = {
            TableName: PANEL_TABLE,
            FilterExpression: "#deviceSerialNumber = :deviceSerialNumber",
            ExpressionAttributeNames: {
                "#deviceSerialNumber": "deviceSerialNumber"
            },
            ExpressionAttributeValues: {
                ":deviceSerialNumber": deviceSerialNumber
            }
        };
        const data = await dynamoDb.scan(params).promise();
        console.log(`homexPanel==> ${JSON.stringify(data)}`);
        return  JSON.stringify(...data.Items);
    } catch (errDB) {
        throw new Error(`Could not fetch: ${errDB.stack}`);
    }
};

async function disableHomexPanel(deviceId) {
    console.log(`>>> Entering updateDeviceStatus() with ${deviceId}`);
    try {
        const timestamp = new Date().toISOString();
        const panel = await getDeviceByDeviceId(deviceId);
        if (panel && !panel.isMaster) {
            console.log(`homex--Panel==> ${panel}`);
            const params = {
                TableName: PANEL_TABLE,
                Key: {
                    "id": deviceId
                },
                UpdateExpression: "set #attrName = :attrValue , #updatedAt = :updatedAt",
                ExpressionAttributeNames: {
                    "#attrName": "isActive",
                    "#updatedAt": "updatedAt"
                },
                ExpressionAttributeValues: {
                    ":attrValue": false,
                    ":updatedAt": timestamp
                },
                ReturnValues: "UPDATED_NEW"
            };
            const data = await dynamoDb.update(params).promise();
            console.log(`homexPanel==> ${JSON.stringify(data)}`);
            return JSON.stringify(data);
        } else {
            throw new Error(`Could not update`);
        }
    } catch (errDB) {
        throw new Error(`Could not fetch: ${errDB.stack}`);
    }
};

exports.addhomexPanel = async (req, res) => {
    console.log('>>> addhomexPanel');
    const timestamp = new Date().toISOString();
    const data = req.body;
    console.log(data);

    if (_.isEmpty(data.deviceSerialNumber)) {
        throw new SerialNumberNotFound(req.t('SerialNumberNotFound'));
    } else if (_.isEmpty(data.accountId)) {
        throw new AccountNotFound(req.t('AccountNotFound'));
    } else {
        const isExist = await isDeviceSerialExist(data.deviceSerialNumber);
        console.log(`isExist => ${isExist}`);
        if (!isExist) {
            console.log('request body verified');
            const params = {
                TableName: PANEL_TABLE,
                Item: {
                    id: uuid.v1(),
                    deviceSerialNumber: data.deviceSerialNumber,
                    accountId: data.accountId,
                    isMaster: false,
                    isActive: true,
                    createdAt: timestamp,
                    updatedAt: timestamp
                }
            };
            const panelObject = {
                "id": params.Item.id,
                "deviceSerialNumber": params.Item.deviceSerialNumber,
                "accountId": params.Item.accountId,
                "isMaster": params.Item.isMaster,
                "isActive": true,
                "createdAt": params.Item.createdAt,
                "updatedAt": params.Item.updatedAt
            };
            console.log('panelObject >> ', panelObject);
            console.log('adding data to dynamodb');
            dynamoDb.put(params, (error, result) => {
                if (error) {
                    res.status(400).json({
                        errorcode: 'PanelAdditionError',
                        errormessage: req.t('PanelAdditionError')
                    });
                }
                res.status(200).json({
                    success: true,
                    account: panelObject
                });
            });
        } else {
            return res.status(400).json({
                errorcode: 'PanelAllreadyExist',
                errormessage: req.t('PanelAllreadyExist')
            });
        }
    }
};


exports.removeSlavehomexPanel = async (req, res) => {
    console.log('||=> Entering function removeSlavehomexPanel');
    const panelId = req.params.id;
    try {
        const result = await disableHomexPanel(panelId);
        if(result)
        return res.status(200).json({
            success: true,
            message: 'Panel removed successfully'
        });
    } catch (error) {
        return res.status(400).json({
            errorcode: error.errorcode,
            errormessage: error.errormessage
        });
    }
};

exports.listAllSlavepanelbyAccount = async (req, res) => {
    console.log('||=> Entering function listAllpanelbyAccount');
    const accountId = req.params.id;
    try {
        const params = {
            TableName: PANEL_TABLE,
            FilterExpression: "#accountId = :accountId AND #isActive = :isActive AND #isMaster = :isMaster",
            ExpressionAttributeNames: {
                "#accountId": "accountId",
                "#isActive": "isActive",
                "#isMaster": "isMaster"
            },
            ExpressionAttributeValues: {
                ":accountId": accountId,
                ":isActive": true,
                ":isMaster": false
            }
        };
        dynamoDb.scan(params, onScan);
        let count = 0;

        function onScan(err, data) {
            let panels = [];
            if (err) {
                console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
                throw new Error('Unable to scan the table');
            } else {
                data.Items.forEach(function (itemdata) {
                    console.log("Panel :", ++count, JSON.stringify(itemdata));
                    panels.push(itemdata);
                });
                // continue scanning if we have more items
                if (typeof data.LastEvaluatedKey != "undefined") {
                    console.log("Scanning for more...");
                    params.ExclusiveStartKey = data.LastEvaluatedKey;
                    docClient.scan(params, onScan);
                } else {
                    return res.status(200).json({
                        success: true,
                        panels
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error JSON:", JSON.stringify(error, null, 2));
        return res.status(400).json({
            errorcode: 'PanelNotFound',
            errormessage: req.t('PanelNotFound')
        });
    }
};


exports.disableSlavePanel = async (req, res) => {
    console.log('||=> Entering function disableSlavePanel');
    const accountId = req.params.id;
    const panelId = req.params.panelId;
    try {
        const result = await disableHomexPanel(panelId);
        if (result)
            return res.status(200).json({
                success: true,
                message: 'Panel removed successfully'
            });
    } catch (error) {
        return res.status(400).json({
            errorcode: error.errorcode,
            errormessage: error.errormessage
        });
    }
};