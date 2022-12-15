const express = require("express");
const jose = require("jose");
const router = express.Router();
const config = require("../config.json");
const fs = require("fs");
const bodyparser = require("body-parser");

const token_key = new TextEncoder().encode(config.token_key);

router.use(bodyparser.raw({ type: (r) => { return true; }, limit: '1mb' }));
router.use("/", express.static(config.uploads_path));
router.put('/:filename', async (req, res) => {
    if (req.query == null || req.query.token == null) {
        res.status(401);
        res.end();
        return;
    }
    try {
        let { payload } = await jose.jwtVerify(req.query.token, token_key, {
            algorithms: ["HS256"], // we use HS256 for the token creation
            issuer: "ReFused/FileUpload", // only allow tokens fetched for file upload
        });
        if (payload.filename == req.params.filename) {
            console.log("Writing file", req.params.filename);
            fs.writeFileSync(`${config.uploads_path}/${req.params.filename}`, req.body);
            res.end();
        } else {
            res.status(403);
            res.end();
        }
    } catch (ex) {
        res.status(401);
        res.end();
        return;
    }
});

module.exports = router;
