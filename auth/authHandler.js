const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');

const jwk = {
    "alg": "RS256",
    "e": "AQAB",
    "kid": "cP1N639UeCX9FSe3v+iacWet+E/xaiNQOvWiRtKX+E4=",
    "kty": "RSA",
    "n": "1PtbQBZ0DzM-JOkS0s5HnUOJDGilJyJRoXrg5U7SnfXVNhIpSQHH-sJh9IYz4K7QEDCe1b2tPfN9s2tVQKpVH4-nS89VCJbQTVNg27Yc-DiX13DVDFMMhot8m1JD5g1t8QPR6zPtdaFbObWcVshSyojpbTyzc-VOg6hovDHtP1Z1Eq4WuvTMhvFn6g2n1X5E8fP7eyOqRdGEqncs2jq7V4JzwM5j6K1UQQLz_EdPWA2qFnL4zIPt6AzQBXLUxVLDItCl4RRWGHB6HtCX-pMRc_s1HTbKgztwPSndaf083dP_iXjSobuZMYuQJmquIKha05b5lf-Ssfig1bpBMoelQQ",
    "use": "sig"
};
const pem = jwkToPem(jwk);

// Policy helper function
const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {};
        policyDocument.Version = '2018-11-21';
        policyDocument.Statement = [];
        const statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = '*';
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    return authResponse;
};


module.exports.auth = async (event, context, callback) => {
    console.log('Received event: :: ' + JSON.stringify(event));
    console.log('context =', context);
    let token;
    if (event.authorizationToken) {
        token = event.authorizationToken;
        console.log('token ==>> ', token);
    } else {
        return callback(new Error('[401] Unauthorized, authorization Token not found'));
    }
    jwt.verify(token, pem, {algorithms: ['RS256']}, (err, decoded) => {
        if (err) {
            console.log('err :: ' + err);
            return callback(new Error('[401] Unauthorized, authorization Token expired'));
        }
        // if everything is good, save to request for use in other routes
        console.log('success :: ',decoded);
        return callback(null, generatePolicy(decoded.sub, 'Allow', event.methodArn));
    });
};