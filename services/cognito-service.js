import CognitoExpress from 'cognito-express';

const load_cognito_service = () => {
    const cognitoExpress = new CognitoExpress({
        region: process.env.COGNITO_REGION,
        cognitoUserPoolId: process.env.COGNITO_USER_POOLID,
        tokenUse: "access", //Possible Values: access | id
        tokenExpiration: 3600000 //Up to default expiration of 1 hour (3600000 ms)
    });

    return cognitoExpress;
}

export const authorize = (cognitoExpress) => (req, res, next) => {

    //Fail if token not present in header. 
    // if (!accessTokenFromClient) return res.status(401).send("Access Token missing from header");

    if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
        //I'm passing in the access token in header under key accessToken
        let accessTokenFromClient = req.headers.authorization.split(" ")[1];
        cognitoExpress.validate(accessTokenFromClient, function (err, response) {

            //If API is not authenticated, Return 401 with error message. 
            if (err) return res.status(401).send(err);

            //Else API has been authenticated. Proceed.
            res.locals.user = response;
            next();
        });

    } else {
        return res.status(401).send("Access Token missing from header");
    }
}

export default load_cognito_service;