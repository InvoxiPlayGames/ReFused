const express = require("express");
const router = express.Router();
const jose = require("jose");
const config = require("../config.json");
const AppTicket = require("steam-appticket");
const { Players } = require("./database");
const { VerifyAuthHeader } = require("./helpers");

// TODO: only download from these URLs if signing is enabled
const SwitchJWK = jose.createRemoteJWKSet(new URL("https://e0d67c509fb203858ebcb2fe3f88c2aa.baas.nintendo.com/1.0.0/certificates"));
const EpicJWK = jose.createRemoteJWKSet(new URL("https://api.epicgames.dev/epic/oauth/v1/.well-known/jwks.json"));

// we store user's owned DLC in this map
var steam_dlc_map = {};
// the token used to validate JWTs
const token_key = new TextEncoder().encode(config.token_key);

const generateRandomHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

router.post("/jwt/", async (req, res) => {
    if (req.body.platform == null || req.body.platform_user_id == null || req.body.platform_username == null || req.body.token == null) {
        res.status(400);
        res.end();
        return;
    }
    var platform_enum = 0;
    switch (req.body.platform) {
        case "stm": {
            platform_enum = 4;
            // parse the appticket, and if the appticket is invalid, bail out
            let parsed_ticket = AppTicket.parseAppTicket(Buffer.from(req.body.token, "hex"), !!config.auth.steam.validate_sig);
            if (parsed_ticket == null) {
                res.status(400);
                res.end();
                return;
            }

            // if signature validation is enabled in the config, and the signature is invalid, we fail
            if (config.auth.steam.validate_sig && !parsed_ticket.hasValidSignature) {
                res.status(403);
                res.end();
                return;
            }

            // make sure that the ticket is valid and for the SteamID we were given, also make sure its for FUSER's appid
            if (parsed_ticket.steamID.getSteamID64() != req.body.platform_user_id &&
                parsed_ticket.is_valid && !parsed_ticket.is_expired &&
                parsed_ticket.appID == 1331440) {
                res.status(403);
                res.end();
                return;
            }
            
            // TODO: if validate_web is set in config.json, validate the ticket against the Steam Web API

            // fill the DLC list with the DLC the user has purchased
            // TODO: include this somewhere else. maybe in our JWT, but that would mean the JWT would be HUGE
            if (parsed_ticket.dlc) {
                const dlc_list = [];
                parsed_ticket.dlc.forEach((d) => {
                    dlc_list.push(d.appID);
                })
                steam_dlc_map[req.body.platform_user_id] = dlc_list;
            }
            break;
        }
        case "epc": {
            platform_enum = 5;
            try {
                // validate the JWT we were given
                let { payload } = await jose.jwtVerify(req.body.token, EpicJWK, {
                    algorithms: ["RS256"], // epic only use this, subject to change
                    audience: "xyza7891gD3tPKNdn0blQ6Ktyc0tRINH", // FUSER's EOS client ID
                    issuer: "https://api.epicgames.dev/epic/oauth/v1", // might change? but seems static
                    subject: req.body.platform_user_id, // make sure the subject of the token is the user
                });
            } catch {
                // if jose fails to validate the JWT, dip out
                if (config.auth.epic.validate_sig) {
                    res.status(403);
                    res.end();
                    return;
                }
            }
            break;
        }
        case "ntd": {
            platform_enum = 3;
            try {
                // validate the JWT we were given
                let { payload } = await jose.jwtVerify(req.body.token, SwitchJWK, {
                    algorithms: ["RS256"], // nintendo only use this, subject to change
                    audience: "ed9e2f05d286f7b8", // the baas service
                    issuer: "https://e0d67c509fb203858ebcb2fe3f88c2aa.baas.nintendo.com", // will always be this
                    subject: req.body.platform_user_id, // make sure the subject of the token is the user
                });

                // make sure that this token is for FUSER and not another game
                if (config.auth.switch.validate_sig && payload.nintendo.ai != "0100e1f013674000") {
                    res.status(403);
                    res.end();
                    return;
                }
            } catch {
                // if jose fails to validate the JWT, dip out
                if (config.auth.switch.validate_sig) {
                    res.status(403);
                    res.end();
                    return;
                }
            }
            break;
        }
        // "xbox" (1) and "ps" (2) options should exist here, but they aren't able to connect to the server :C
        default: {
            res.status(400);
            res.end();
            return;
        }
    }

    var user = await Players.findOne({ where: {platform_enum, platform_user_id: req.body.platform_user_id} });
    if (user == null) {
        console.log(`Creating a new account for ${req.body.platform} user "${req.body.platform_username}" (${req.body.platform_user_id})...`);

        // TODO: generate a valid hype username. for now just use the platform username and some randomness
        let hype_username = req.body.platform_username + "#" + generateRandomHex(4);

        // add the user entry to the database
        user = await Players.create({
            platform_enum,
            platform_user_id: req.body.platform_user_id,
            platform_username: req.body.platform_username,
            banned: false,
            creation_time: Date.now(),
            last_seen: Date.now(),
            crossplay_enabled: true,
            elder_credit_count: 0,
            avatar_filename: "ava_" + generateRandomHex(32) + ".bin",
            profile_pic_filename: "pfp_" + generateRandomHex(32) + ".jpg",
            hype_username
        });
    } else {
        // update the user with their platform username
        Players.update({ platform_username: req.body.platform_username }, { where: {id: user.id} });
    }

    if (user == null || user.banned == true) {
        res.status(403);
        res.end();
        return;
    }

    console.log(`Successful login! User ID: ${user.id} - ${user.hype_username} - Platform ${req.body.platform} "${req.body.platform_username}" (${req.body.platform_user_id})`);

    // sign the token and give to the user
    let token = await new jose.SignJWT({
        platform: {
            enum: platform_enum,
            type: req.body.platform,
            user_id: req.body.platform_user_id
        }
    }).setProtectedHeader({ alg: 'HS256' })
        .setSubject(user.id)
        .setIssuer("ReFused/GameLogin")
        .setIssuedAt()
        .setExpirationTime('10m')
        .sign(token_key);
    
    res.json({ results: {
        token,
        prefix: "JWT",
        user_id: user.id,
        //encoded_user_id: "sex", // base32 encoded? game doesn't need it, though
        has_profane_name: false,
        token_duration: 60 * 10
    }});
});

router.use("/steam/owned_dlc", VerifyAuthHeader);
router.get("/steam/owned_dlc/", async (req, res) => {
    var owned_dlc = [];
    // look up the list of purchased DLC in-memory and return
    if (req.token.platform.enum == 4 && steam_dlc_map[req.token.platform.user_id]) {
        owned_dlc = steam_dlc_map[req.token.platform.user_id];
    }
    res.json({ results: {
        owned_dlc
    }});
});

module.exports = router;
