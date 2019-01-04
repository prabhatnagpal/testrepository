const _ = require('lodash');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
global.fetch = require('node-fetch');
const validator = require('validator');

const dynamoDb = require('../db/dynamodb');
const USERS_TABLE = process.env.USERS_TABLE;
const config = require('../config/aws.json');
//Error Imports
const UsernameNotFound = require('../error/UsernameNotFound');
const PasswordNotFound = require('../error/PasswordNotFound');
const WrongCredentials = require('../error/WrongCredentials');
const EmailIdNotFound = require('../error/EmailIdNotFound');


module.exports.login = (req, res) => {
    console.log(">> Entering Login Function");
    const body = _.pick(req.body, ['userName', 'password']);
 
    console.log("userName",body.userName);
    body.userName = (body.userName).toLowerCase();
    console.log("userName",body.userName);

    if (_.isEmpty(body.userName)) {
        console.error('userName cannot be empty.');
        throw new UsernameNotFound(req.t('UsernameNotFound'));

    } else if (!validator.isEmail(body.userName)) {
        console.error('userName cannot be empty.');
        throw new EmailIdNotFound(req.t('WrongFormattedEmailId'));

    } else if (_.isEmpty(body.password)) {
        console.error('password cannot be empty.');
        throw new PasswordNotFound(req.t('PasswordNotFound'));

    } else {
        var params = {
            TableName: USERS_TABLE,
            KeyConditionExpression: "#uname = :username",
            ExpressionAttributeNames: {
                "#uname": "userName"
            },
            ExpressionAttributeValues: {
                ":username": body.userName
            }
        };

        dynamoDb.query(params, (error, result) => {
            if (error) {
                console.error("Unable to query. Error:", JSON.stringify(error, null, 2));
                console.error('wrong username or password');
                res.status(401).json({
                    errorcode: 'WrongCredentials',
                    errormessage: req.t('WrongCredentials')
                });
            } else {
                console.log("Query succeeded.");
                console.log("Query succeeded." + JSON.stringify(result));
                if (result.Items.length > 0) {
                    console.log("Query succeeded || >>> " + result.Items.length);
                    result.Items.forEach(function (item) {
                        console.log(" Item :: ", JSON.stringify(item));
                        const user = item;
                        console.log(" user :: ", user);
                            // Aws congnito related logic
                            const poolData = {
                                UserPoolId: config.aws.UserPoolId,
                                ClientId: config.aws.ClientId
                            };
                            const pool_region = config.aws.region;
                            const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
                            const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
                                Username: body.userName,
                                Password: body.password,
                            });
                            var userData = {
                                Username: body.userName,
                                Pool: userPool
                            };
                            const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
                            cognitoUser.authenticateUser(authenticationDetails, {
                                onSuccess: function (result) {
                                   //  const now = new Date();
                                   // now.setUTCMilliseconds(result.getAccessToken().getExpiration());
                                   const expirationTime = result.getAccessToken().getExpiration() - result.getAccessToken().getIssuedAt();
                                    res.status(200).json({
                                        success: true,
                                        user: user,
                                        token: result.getAccessToken().getJwtToken(),
                                        refreshtoken: result.getRefreshToken().getToken(),
                                        tokenexpiration:expirationTime
                                    });
                                },
                                onFailure: function (errCognito) {
                                    console.log(errCognito);
                                    res.status(401).json({
                                        errorcode: 'WrongCredentials',
                                        errormessage: req.t('WrongCredentials')
                                    });
                                },
                            });
                    });
                } else {
                    console.log(`userName not found`, body.userName);
                    res.status(401).json({
                        errorcode: 'EmailIDNotExist',
                        errormessage: req.t('EmailIDNotExist')
                    });
                }
            }
        });
    }
};



module.exports.logout = (req, res) => {
    console.log(">> Entering logout Function");
    const body = _.pick(req.body, ['userName']);

    console.log("userName", body.userName);
    body.userName = (body.userName).toLowerCase();
    console.log("userName", body.userName);

    if (_.isEmpty(body.userName)) {
        console.error('userName cannot be empty.');
        throw new UsernameNotFound(req.t('UsernameNotFound'));
    } else if (!validator.isEmail(body.userName)) {
        console.error('userName cannot be empty.');
        throw new EmailIdNotFound(req.t('WrongFormattedEmailId'));
    } else {
        // Aws congnito related logic
        const poolData = {
            UserPoolId: config.aws.UserPoolId,
            ClientId: config.aws.ClientId
        };
        const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        var userData = {
            Username: body.userName,
            Pool: userPool
        };
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        try {
            cognitoUser.signOut();
            return res.status(200).json({
                success: true,
                message: req.t('logoutsuccess')
            });
        } catch (errCognito) {
            console.log(errCognito);
          return res.status(401).json({
                errorcode: errCognito.errorcode,
                errormessage: errCognito.errormessage
            });
        }
    }
};