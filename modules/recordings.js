const express = require("express");
const router = express.Router();
const config = require("../config.json");
const { Players, Recordings } = require("./database");
const { VerifyAuthHeader, GenerateRandomHex, GenerateFilePutURL } = require("./helpers")

router.use(VerifyAuthHeader);

router.post("/new/", async (req, res) => {
    // update the user's last seen value to know if they're online
    // TODO: input validation, upload authentciation
    try {
        var mix = await Recordings.create({
            player_id: req.token.sub,
            mix_name: req.body.mix_name,
            creation_time: Date.now(),
            included_songs_json: JSON.stringify(req.body.song_shortnames),
            meta_data_json: JSON.stringify(req.body.meta_data),
            venue_name: req.body.venue_name,
            venue_time_of_day: req.body.venue_time_of_day,
            campaign_mission: req.body.campaign_mission_name,
            challenge_id: req.body.challenge_id,
            recording_client_id: req.body.recording_client_id,
            asset_filename: "mix_" + GenerateRandomHex(32) + ".bin",
            thumbnail_filename: "mix_" + GenerateRandomHex(32) + ".jpg",
        });
        res.json({ results: {
            asset_upload_url: await GenerateFilePutURL(mix.asset_filename),
            image_upload_url: await GenerateFilePutURL(mix.thumbnail_filename),
            recording_id: mix.id,
            created: Math.floor(mix.creation_time / 1000),
            mix_name: mix.mix_name
        }});
    } catch {
        res.status(400);
        res.end();
        return;
    }
});

router.post("/get_list/", async (req, res) => {
    if (req.body.user_id == null || req.body.page == null || req.body.pageSize == null || req.body.pageSize > 100) {
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
    // fetch that user's mixes
    var offset = (req.body.page * req.body.pageSize) - req.body.pageSize;
    var mixes_count = await Recordings.count({ where: {player_id: req.body.user_id} });
    var mixes_db = await Recordings.findAll({ where: {player_id: req.body.user_id}, limit: req.body.pageSize, offset });
    var mixes = [];
    mixes_db.forEach((mix) => {
        mixes.push({
            asset_download_url: `${config.host_url}/uploads/${mix.asset_filename}`,
            image_download_url: `${config.host_url}/uploads/${mix.thumbnail_filename}`,
            image_medium_download_url: `${config.host_url}/uploads/${mix.thumbnail_filename}`,
            image_small_download_url: `${config.host_url}/uploads/${mix.thumbnail_filename}`,
            recording_id: mix.id,
            has_praised: false,
            created: Math.floor(mix.creation_time / 1000), // unix timestamp
            view_count: 0,
            praise_count: 0,
            snapshot_count: 0,
            mix_name: mix.mix_name,
            is_remix: false,
            remix_parent: null,
            challenge: null,
            is_active_challenge_submission: false,
            campaign_mission: null,
            venue: {
                venue_name: mix.venue_name // this metadata is sent in the upload request
            },
            venue_time_of_day: mix.venue_time_of_day,
            user: {
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
            }
        });
    });
    res.json({ results: {
        current_page: req.body.page,
        num_pages: Math.ceil(mixes_count / req.body.pageSize),
        total_entries: mixes_count,
        recordings: mixes
    }});
});

module.exports = router;
