const jose = require("jose");
const config = require("../config.json");
const { Players } = require("./database");

// the token used to validate JWTs
const token_key = new TextEncoder().encode(config.token_key);

// function to generate file urls
const GenerateFilePutURL = async (filename) => {
    let token = await new jose.SignJWT({ filename }).setProtectedHeader({ alg: 'HS256' })
        .setIssuer("ReFused/FileUpload")
        .setIssuedAt()
        .setExpirationTime('30s')
        .sign(token_key);
    return `${config.host_url}/uploads/${filename}?token=${token}`;
}

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

// random string generator
const GenerateRandomHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

module.exports = { VerifyAuthHeader, GenerateRandomHex, GenerateFilePutURL };
