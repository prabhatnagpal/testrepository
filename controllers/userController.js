const uuid = require('uuid');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
global.fetch = require('node-fetch');
const validator = require('validator');
const _ = require('lodash');

const dynamoDb = require('../db/dynamodb');
const USERS_TABLE = process.env.USERS_TABLE;
const config = require('../config/aws.json');

const EmailIdNotFound = require('../error/EmailIdNotFound');
const AccountNotFound = require('../error/AccountNotFound');
const UsernameNotFound = require('../error/UsernameNotFound');
const PasswordNotFound = require('../error/PasswordNotFound');
const FirstNameNotFound = require('../error/FirstNameNotFound');
const InvalidPasswordException = require('../error/InvalidPasswordException');
const RefreshToken = require('../error/RefreshToken');
const VerifyUserError = require('../error/VerifyUserError');
const VerificationCodeNotFound = require('../error/VerificationCodeNotFound');

module.exports.registerUser = (req, res) => {
    console.log('>>> Entering registerUser Function >> ', req.body);
    const timestamp = new Date().toISOString();
    const data = req.body;

    if (_.isEmpty(data.emailId)) {
        console.error('emailId cannot be empty');
        throw new EmailIdNotFound(req.t('EmailIdNotFound'));
    } else if (!validator.isEmail(data.emailId)) {
        console.error('emailId is not correct');
        throw new EmailIdNotFound(req.t('WrongFormattedEmailId'));
    } else if (_.isEmpty(data.userName)) {
        console.error('userName cannot be empty.');
        throw new UsernameNotFound(req.t('UsernameNotFound'));
    } else if (!validator.isEmail(data.userName)) {
        console.error('userName emailId is not correct');
        throw new UsernameNotFound(req.t('UsernameMustEMail'));
    } else if (_.isEmpty(data.password)) {
        console.error('password cannot be empty.');
        throw new PasswordNotFound(req.t('PasswordNotFound'));
    } else if (!validator.matches(data.password,"^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")) {
        console.error('password does not match regex');
        throw new InvalidPasswordException(req.t('InvalidPasswordException'));
    }else if (_.isEmpty(data.firstName)) {
        console.error('firstName cannot be empty.');
        throw new FirstNameNotFound(req.t('FirstNameNotFound'));
    } else {
        console.log("userName",data.userName);
        data.userName = (data.userName).toLowerCase();
        data.emailId = (data.emailId).toLowerCase();
        console.log("userName",data.userName);
        const params = {
            TableName: USERS_TABLE,
            KeyConditionExpression: "#uname = :username",
            ExpressionAttributeNames: {
                "#uname": "userName"
            },
            ExpressionAttributeValues: {
                ":username": data.userName
            }
        };

        dynamoDb.query(params, (error, result) => {
            if (error) {
                //to be changed
                console.error("Unable to query. Error:", JSON.stringify(error, null, 2));
                res.status(400).json({
                    errorcode: 'AccountCreationError',
                    errormessage: req.t('AccountCreationError')
                });
            } else {
                console.log("Query succeeded.");
                console.log("Query succeeded." + JSON.stringify(result));
                if (result.Items.length > 0) {
                    res.status(400).json({
                        errorcode: 'UserNameAlreadyExists',
                        errormessage: req.t('UserNameAlreadyExists')
                    });
                } else {
                    // Aws congnito related logic
                    const poolData = {
                        UserPoolId: config.aws.UserPoolId,
                        ClientId: config.aws.ClientId
                    };
                    const pool_region = config.aws.region;
                    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

                    console.log("pool set up done. now setting up data to list ");
                    let attributeList = [];
                    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({
                        Name: "email",
                        Value: data.emailId
                    }));
                    console.log("now signup congnito");

                    userPool.signUp(data.emailId, data.password, attributeList, null, (err, result) => {
                        if (err) {
                            console.error(err);
                            const exception = err.code;
                            if (exception === 'ResourceNotFoundException' || exception === 'NotAuthorizedException') {
                                return res.status(401).json({
                                    errorcode: err.code,
                                    errormessage: err.message
                                });
                            } else {
                                return res.status(400).json({
                                    errorcode: err.code,
                                    errormessage: err.message
                                });
                            }
                        }
                        cognitoUser = result.user;
                        console.log('user name is ', cognitoUser);
                        console.log("congnito signup end");
                        let accountIds = [];
                        if(data.accountId) {
                            accountIds[0] = data.accountId;
                        } 
                        const params = {
                            TableName: USERS_TABLE,
                            Item: {
                                emailId: data.emailId,
                                firstName: data.firstName,
                                lastName: data.lastName,
                                userName: data.userName,
                                accountIds: accountIds,
                                role: data.role || 'user',
                                mobileNumber: data.mobilenumber,
                                isActive: true,
                                createdAt: timestamp,
                                updatedAt: timestamp
                            }
                        };
                        const user = {
                            'emailId': params.Item.emailId,
                            "firstName": params.Item.firstName,
                            "lastName": params.Item.lastName,
                            "userName": params.Item.userName,
                            "accountIds":params.Item.accountIds,
                            "role": params.Item.role,
                            "isActive": true,
                            "mobileNumber": params.Item.mobileNumber,
                            "createdAt": params.Item.createdAt,
                            "updatedAt": params.Item.updatedAt
                        };
                        console.log('adding user to dynamodb');
                        dynamoDb.put(params, (error, result) => {
                            if (error) {
                                console.error(error);
                                res.status(400).json({
                                    errorcode: 'UserNameAlreadyExists',
                                    errormessage: req.t('UserNameAlreadyExists')
                                });
                            }
                            res.status(200).json({
                                success: true,
                                user: user
                            });
                        });
                    });
                }
            }
        });
    }
};

module.exports.getUser = (req, res) => {
    console.log('>>>getUser', req);
    let userName = req.params.username;
    userName = userName.toLowerCase();
    console.log('userName==>' + userName);

    var params = {
        TableName: USERS_TABLE,
        KeyConditionExpression: "#uname = :username",
        ExpressionAttributeNames: {
            "#uname": "userName"
        },
        ExpressionAttributeValues: {
            ":username": userName
        }
    };

    dynamoDb.query(params, (error, result) => {
        if (error) {
            console.error("Unable to query. Error:", JSON.stringify(error, null, 2));
            res.status(400).json({
                errorcode: 'UserNotFound',
                errormessage: req.t('UserNotFound')
            });
        } else {
            console.log("Query succeeded.");
            console.log("Query succeeded." + JSON.stringify(result));
            let user;
            result.Items.forEach(function (item) {
                console.log(" Item :: ", JSON.stringify(item));
                user = item;
            });
            if (result && result.Items) {
                res.status(200).json({
                    success: true,
                    user: user
                });
            } else {
                console.log("No User found");
                res.status(400).json({
                    errorcode: 'UserNotFound',
                    errormessage: req.t('UserNotFound')
                });
            }
        }
    });
};
module.exports.verifyUser = (req, res) => {
    console.log('>>>verifyUser');
    console.log('request body==>', req.body);
    const data = req.body;
    data.emailId = (data.emailId).toLowerCase();
    console.log('data==>', data);
    // Aws congnito related logic
    const poolData = {
        UserPoolId: config.aws.UserPoolId,
        ClientId: config.aws.ClientId
    };
    const pool_region = config.aws.region;
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
        Username: data.emailId,
        Pool: userPool
    };
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmRegistration(data.pin, true, function (err, result) {
        if (err) {
            console.log(err);
            console.error('Could not verify account!');
            throw new VerifyUserError(req.t('VerifyUserError'));
        }
        if (result == "SUCCESS") {
            console.log("Successfully verified account!");
            cognitoUser.signOut();
            res.status(200).json({
                success: true,
                message: "Successfully verified account!"
            });
        } else {
            console.error('Could not verify account!');
            throw new VerifyUserError(req.t('VerifyUserError'));
        }
    });
};


module.exports.getUserByAccount = (req, res) => {
    console.log('>>>getUserByAccount ', req);
    const accountId = req.params.id;
    if (_.isEmpty(accountId)) {
        console.error('accountId cannot be empty.');
        throw new AccountNotFound(req.t('AccountIdNotFound'));
    } else {
        console.log(`request verified now retriving account for Id: ${accountId}`);
        var params = {
            TableName: USERS_TABLE,
            "FilterExpression": "accountId IN (:accountId)",
            ExpressionAttributeValues: {
                ":accountId": accountId
            }
        };

        dynamoDb.scan(params, (error, result) => {
            if (error) {
                console.error("Unable to query. Error:", JSON.stringify(error, null, 2));
                console.log("No User found");
                res.status(404).json({
                    errorcode: 'UserNotFound',
                    errormessage: req.t('UserNotFound')
                });
            } else {
                console.log("Query succeeded.");
                console.log("Query succeeded." + JSON.stringify(result));
                if (result && result.Items) {
                    res.status(200).json({
                        success: true,
                        user: result.Items
                    });
                } else {
                    console.log("No User found");
                    res.status(400).json({
                        errorcode: 'UserNotFound',
                        errormessage: req.t('UserNotFound')
                    });
                }
            }
        });
    }
};


module.exports.isUserConfirm = (req, res) => {
    console.log('>>>isUserConfirm');
    const body = _.pick(req.body, ['userName', 'password']);
    console.log('>>> request body', body);
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
        console.log('>>> request body verified');
        console.log("userName",body.userName);
        body.userName = (body.userName).toLowerCase();
        console.log("userName",body.userName);
        // Aws congnito related logic
        const poolData = {
            UserPoolId: config.aws.UserPoolId,
            ClientId: config.aws.ClientId
        };
        console.log('>>> poolData', poolData);
        const pool_region = config.aws.region;
        const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        console.log('authenticationDetails');
        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: body.userName,
            Password: body.password,
        });
        const userData = {
            Username: body.userName,
            Pool: userPool
        };
        console.log('>>> userData', userData);
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        console.log('authenticateUser');
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                console.log('access token + ' + result.getAccessToken().getJwtToken());
                res.status(200).json({
                    success: true,
                    message: "user is confirmed"
                });
            },
            onFailure: function (errCognito) {
                console.log('errCognito ||>>', errCognito);
                const errorcode = errCognito.code;
                if (errorcode === 'UserNotConfirmedException') {
                    res.status(401).json({
                        errorcode: 'UserNotConfirmedException',
                        errormessage: req.t('UserNotConfirmedException')
                    });
                } else {
                    res.status(401).json({
                        errorcode: 'WrongCredentials',
                        errormessage: req.t('WrongCredentials')
                    });
                }
            },
        });
    }
};

module.exports.resetPasswordVerificationCode = (req, res) => {
    console.log('|| >> Entering forgotPassword ');
    const body = _.pick(req.body, ['userName']);

    if (_.isEmpty(body.userName)) {
        console.error('userName cannot be empty.');
        throw new UsernameNotFound(req.t('UsernameNotFound'));

    } else if (!validator.isEmail(body.userName)) {
        console.error('userName cannot be empty.');
        throw new EmailIdNotFound(req.t('WrongFormattedEmailId'));

    } else {
        console.log("userName",body.userName);
        body.userName = (body.userName).toLowerCase();
        console.log("userName",body.userName);

        // Aws congnito related logic
        const poolData = {
            UserPoolId: config.aws.UserPoolId,
            ClientId: config.aws.ClientId
        };
        console.log('>>> poolData', poolData);
        const pool_region = config.aws.region;
        const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        console.log('authenticationDetails');
        const userData = {
            Username: body.userName,
            Pool: userPool
        };
        console.log('>>> userData', userData);
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUser.forgotPassword({
            onSuccess: function (result) {
                console.log('call result: ', result);
                res.status(200).json({
                    success: true,
                    message: 'verification email successfully sent'
                });
            },
            onFailure: function (cognitoerr) {
                console.log('cognitoerr==>> ', cognitoerr);
                res.status(400).json({
                    errorcode: cognitoerr.code,
                    errormessage: cognitoerr.message
                });
            }
        });
    }
};

module.exports.resendConfirmation = (req, res) => {
    console.log('|| >> Entering resendConfirmation ');
    const body = _.pick(req.body, ['userName']);

    if (_.isEmpty(body.userName)) {
        console.error('userName cannot be empty.');
        throw new UsernameNotFound(req.t('UsernameNotFound'));

    } else if (!validator.isEmail(body.userName)) {
        console.error('userName cannot be empty.');
        throw new EmailIdNotFound(req.t('WrongFormattedEmailId'));

    } else {
        console.log("userName",body.userName);
        body.userName = (body.userName).toLowerCase();
        console.log("userName",body.userName);
        // Aws congnito related logic
        const poolData = {
            UserPoolId: config.aws.UserPoolId,
            ClientId: config.aws.ClientId
        };
        console.log('>>> poolData', poolData);
        const pool_region = config.aws.region;
        const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        console.log('userPool', userPool);
        const userData = {
            Username: body.userName,
            Pool: userPool
        };
        console.log('>>> userData', userData);
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUser.resendConfirmationCode((cognitoerr, result) => {
            if (cognitoerr) {
                console.log('cognitoerr==>> ', cognitoerr);
                return res.status(400).json({
                    errorcode: cognitoerr.code,
                    errormessage: cognitoerr.message
                });
            } else {
                console.log('call result: ', result);
                res.status(200).json({
                    success: true,
                    message: 'verification email successfully sent'
                });
            }
        });
    }
};



module.exports.resetPassword = (req, res) => {
    console.log('|| >> Entering resetPassword ');
    const body = _.pick(req.body, ['userName', 'verificationCode', 'password']);

    if (_.isEmpty(body.userName)) {
        console.error('userName cannot be empty.');
        throw new UsernameNotFound(req.t('UsernameNotFound'));

    } else if (!validator.isEmail(body.userName)) {
        console.error('userName cannot be empty.');
        throw new EmailIdNotFound(req.t('WrongFormattedEmailId'));

    } else if (_.isEmpty(body.verificationCode)) {
        console.error('verificationCode cannot be empty.');
        throw new VerificationCodeNotFound(req.t('verificationCodeNotFound'));

    } else if (_.isEmpty(body.password)) {
        console.error('password cannot be empty.');
        throw new PasswordNotFound(req.t('PasswordNotFound'));

    } else if (!validator.matches(body.password,"^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")) {
        console.error('password does not match regex');
        throw new InvalidPasswordException(req.t('InvalidPasswordException'));
    } else {
        console.log("userName",body.userName);
        body.userName = (body.userName).toLowerCase();
        console.log("userName",body.userName);
        
        // Aws congnito related logic
        const poolData = {
            UserPoolId: config.aws.UserPoolId,
            ClientId: config.aws.ClientId
        };
        console.log('>>> poolData', poolData);
        const pool_region = config.aws.region;
        const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        console.log('userPool', userPool);
        const userData = {
            Username: body.userName,
            Pool: userPool
        };
        console.log('>>> userData', userData);
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        console.log('**************confirmPassword**********************');
        cognitoUser.confirmPassword(body.verificationCode, body.password, {
            onSuccess: function (result) {
                console.log('result => ', result);
                res.status(200).json({
                    success: true,
                    message: "password succesfully changed"
                });
            },
            onFailure: function (errCognito) {
                console.log('errCognito=>', errCognito);
                return res.status(401).json({
                    errorcode: errCognito.code,
                    errormessage: errCognito.message
                });
            }
        });
    }
};

module.exports.linkUsertoAccount = (accountId, emailId) => {
    console.log('|| >> Entering linkUsertoAccount with accountId :', accountId);
    const timestamp = new Date().toISOString();
    emailId = emailId.toLowerCase();
    const params = {
        TableName: USERS_TABLE,
        Key: {
            "userName": emailId
        },
        UpdateExpression: "set #attrName = list_append(#attrName, :attrValue)",
        ExpressionAttributeNames: {
            "#attrName": "accountIds"
        },
        ExpressionAttributeValues: {
            ":attrValue": [accountId]
        },
        ReturnValues: "UPDATED_NEW"
    };
    dynamoDb.update(params, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(data);
        }
    });
};


module.exports.updateEmail = (req, res) => {
    console.log('|| >> Entering updateEmail :', req);
    console.log('>>>getUser', req);
    let userName = req.params.username;
    userName = userName.toLowerCase();
    console.log('userName==>' + userName);

    const body = _.pick(req.body, ['emailId']);
    console.log("emailId", body.emailId);
    body.emailId = (body.emailId).toLowerCase();
    console.log("emailId", body.emailId);

    console.log("||==> validating requst");
    if (_.isEmpty(body.emailId)) {
        console.error('emailId cannot be empty.');
        throw new UsernameNotFound(req.t('UsernameNotFound'));

    } else if (!validator.isEmail(body.emailId)) {
        console.error('wrong emailId');
        throw new EmailIdNotFound(req.t('WrongFormattedEmailId'));

    } else {
        console.log("||==> updateEmail requst validated");
        const params = {
            TableName: USERS_TABLE,
            Key: {
                "userName": userName
            },
            UpdateExpression: "set #attrName = :attrValue",
            ExpressionAttributeNames: {
                "#attrName": "emailId"
            },
            ExpressionAttributeValues: {
                ":attrValue": body.emailId
            },
            ReturnValues: "UPDATED_NEW"
        };
        dynamoDb.update(params, function (err, data) {
            if (err) {
                console.log(err);
                return res.status(400).json({
                    errorcode: 'EmailUpdateException',
                    errormessage: req.t('EmailUpdateException')
                });
            } else {
                console.log(data);
                return res.status(200).json({
                    success: true,
                    message: "Email updated succesfully"
                });
            }
        });
        console.log("||==> Email requst updated");
    }
};


module.exports.refreshtoken = (req, res) => {
    console.log(">> Entering refreshtoken Function");
    let userName = req.params.username;
    userName = userName.toLowerCase();
    console.log('userName==>' + userName);
    const refToken = req.get('refreshToken');

    if (!validator.isEmail(userName)) {
        console.error('userName cannot be empty.');
        throw new EmailIdNotFound(req.t('WrongFormattedEmailId'));

    } else if (!refToken) {
        console.error('refreshToken cannot be empty.');
        throw new RefreshToken(req.t('RefreshToken'));

    } else {
        console.log("|| ==> refrshing tokens");
        const refreshToken = new AmazonCognitoIdentity.CognitoRefreshToken({
            RefreshToken: refToken
        });
        // Aws congnito related logic
        const poolData = {
            UserPoolId: config.aws.UserPoolId,
            ClientId: config.aws.ClientId
        };
        const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        var userData = {
            Username: userName,
            Pool: userPool
        };
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUser.refreshSession(refreshToken, (err, session) => {
            if (err) {
                return res.status(400).json({
                    errorcode: 'RefreshTokenException',
                    errormessage: req.t('RefreshTokenException')
                });
            }
            console.log('session =>', session);
            const expirationTime = session.getAccessToken().getExpiration() - session.getAccessToken().getIssuedAt();
            return res.status(200).json({
                success: true,
                token: session.getAccessToken().getJwtToken(),
                refreshToken: session.getRefreshToken().getToken(),
                tokenexpiration: expirationTime
            });
        });
    }
};