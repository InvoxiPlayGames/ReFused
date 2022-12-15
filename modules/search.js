const express = require("express");
const router = express.Router();
const config = require("../config.json");
const { Players } = require("./database");
const { Op } = require("sequelize");
const { VerifyAuthHeader } = require("./helpers")

router.use(VerifyAuthHeader);

router.post("/username/", async (req, res) => {
    // search for the user
    var offset = (req.body.page * req.body.pageSize) - req.body.pageSize;
    var users_count = await Players.count({ where: { hype_username: {[Op.like]: `%${req.body.search}%` } } });
    var users_db = await Players.findAll({ where: { hype_username: {[Op.like]: `%${req.body.search}%` } }, limit: req.body.pageSize, offset });
    var users = [];
    users_db.forEach((user) => {
        if (user.id == req.token.sub) return;
        users.push({
            user_id: user.id,
            hype_username: user.hype_username,
            is_followed: false,
            follows_you: false,
            online_status: null,
            platform_profile: {
                platform_enum_code: user.platform_enum,
                platform_user_id: user.platform_user_id,
                platform_username: user.platform_username,
                user_id: user.id
            },
            profile_pic: {
                image_download_url: `${config.host_url}/uploads/${user.profile_pic_filename}`,
                image_medium_download_url: `${config.host_url}/uploads/${user.profile_pic_filename}`,
                image_small_download_url: `${config.host_url}/uploads/${user.profile_pic_filename}`,
                pic_id: user.id
            }
        });
    });
    res.json({ results: {
        current_page: req.body.page,
        num_pages: Math.ceil(users_count / req.body.pageSize),
        total_entries: users_count,
        search_results: users
    }});
});

module.exports = router;
