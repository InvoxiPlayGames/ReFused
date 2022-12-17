const express = require("express");
const router = express.Router();
const config = require("../config.json");
const { Players } = require("./database");
const { VerifyAuthHeader, GenerateFilePutURL, EnumToPlatformName } = require("./helpers");

router.use(VerifyAuthHeader);

router.get("/ping/", async (req, res) => {
    // update the user's last seen value to know if they're online
    Players.update({ last_seen: Date.now() }, { where: {id: req.token.sub} });
    res.json({ results: { status: "ok" }});
});

// avatar asset upload
router.get('/avatar/', async (req, res) => {
    // TODO: add authentication token generation
    var user = await Players.findOne({ attributes: ['avatar_filename'], where: {id: req.token.sub} })
    res.json({ results: {
        asset_upload_url: await GenerateFilePutURL(user.avatar_filename)
    }})
});

// profile pic asset upload
router.get('/profile_pic/', async (req, res) => {
    // TODO: add authentication token generation
    var user = await Players.findOne({ attributes: ['profile_pic_filename'], where: {id: req.token.sub} });
    res.json({ results: {
        asset_upload_url: await GenerateFilePutURL(user.profile_pic_filename)
    }})
});


router.post("/xp/", async (req, res) => {
    // keep track of the XP the user had when they started to retroactively grant rewards
    var user = await Players.findOne({ attributes: ['starting_xp'], where: {id: req.token.sub} });
    if (user.startingxp == null || user.startingxp < 1) {
        Players.update({ starting_xp: req.body.hype_profile.xp }, { where: {id: req.token.sub} });
    }
    // update the user's XP value
    Players.update({ xp: req.body.hype_profile.xp }, { where: {id: req.token.sub} });
    res.json({}); // does the game care about a response here?
});

router.post("/get/", async (req, res) => {
    if (req.body.user_id == null) {
        res.status(400);
        res.end();
        return;
    }
    // fetch the requested user
    var user = await Players.findOne({ where: {id: req.body.user_id} })
    if (user == null) {
        res.status(404);
        res.end();
        return;
    }
    res.json({ results: {
        user_id: user.id,
        avatar: {
            asset_download_url: config.host_url + "/uploads/" + user.avatar_filename
        },
        profile_pic: {
            asset_download_url: config.host_url + "/uploads/" + user.profile_pic_filename,
            asset_medium_download_url: config.host_url + "/uploads/" + user.profile_pic_filename,
            asset_small_download_url: config.host_url + "/uploads/" + user.profile_pic_filename,
            pic_id: user.id
        },
        platform_profile: {
            platform_enum_code: user.platform_enum,
            platform_user_id: user.platform_user_id,
            platform_username: `<img id="${EnumToPlatformName(user.platform_enum)}"/> ` + user.platform_username,
            user_id: user.id
        },
        elder_credits: {
            amount: 0,
            progress_to_next_credit: 0.00
        },
        hype_username: user.hype_username,
        follows_you: false,
        is_banned: user.banned,
        is_blocked: false,
        is_followed: false,
        follows_you: false,
        online_status: null, // TODO set this to "online" when the user has pinged within the last 30 seconds
        player_type: {
            type_id: 1,
            type_name: "Up and Comer"
        },
        stats: null, // TODO later
        hype_profile: {
            xp: user.xp
        } // TODO fill in later
    }});
});

module.exports = router;
