const jose = require("jose");
const config = require("../config.json");
const { Players } = require("./database");

// the token used to validate JWTs
const token_key = new TextEncoder().encode(config.token_key);

// middleware to verify user tokens
const VerifyAuthHeader = async (req, res, next) => {
    // if we don't have an auth header, it's not right
    let token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(403);
        res.end();
        return;
    }
    // validate the token and add the decoded body to the request object
    try {
        let { payload } = await jose.jwtVerify(token, token_key, {
            algorithms: ["HS256"], // we use HS256 for the token creation
            issuer: "ReFused/GameLogin", // only allow tokens fetched from game login
        });
        req.token = payload;
    } catch {
        res.status(403);
        res.end();
        return;
    }
    // continue the request
    next();
}

module.exports = { VerifyAuthHeader };
