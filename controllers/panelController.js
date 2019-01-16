const uuid = require('uuid');
const _ = require('lodash');

const dynamoDb = require('../db/dynamodb');
const PANEL_TABLE = process.env.PANEL_TABLE;
//Custom Error imports
const SerialNumberNotFound = require('../error/SerialNumberNotFound');
const AccountNotFound = require('../error/AccountNotFound');


module.exports.addhomexPanel = (req, res) => {
    console.log('>>> addhomexPanel');
    const timestamp = new Date().toISOString();
    const data = req.body;
    console.log(data);

    if (_.isEmpty(data.deviceSerialNumber)) {
        throw new SerialNumberNotFound(req.t('SerialNumberNotFound'));
    } else if (_.isEmpty(data.accountId)) {
        throw new AccountNotFound(req.t('AccountNotFound'));
    } else {
        console.log('request body verified');
        const params = {
            TableName: PANEL_TABLE,
            Item: {
                id: uuid.v1(),
                deviceSerialNumber: data.deviceSerialNumber,
                accountId: data.accountId,
                isMaster: data.isMaster || false,
                isActive: true,
                createdAt: timestamp,
                updatedAt: timestamp
            }
        };
        const panelObject = {
            "id": params.Item.id,
            "deviceSerialNumber": params.Item.deviceSerialNumber,
            "accountId": params.accountId,
            "isMaster": data.isMaster,
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
    }
};