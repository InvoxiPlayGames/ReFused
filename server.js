const fs = require("fs");
const express = require("express");
const config = require("./config.json");
const app = express();
const api = express();
const { startDB } = require("./modules/database");

// parse all incoming data on the API as json, that's what it'll be
api.use(express.json({ strict: true }));

api.use("/auth", require("./modules/auth"));
api.use("/players", require("./modules/players"));
api.use("/recordings", require("./modules/recordings"));
api.use("/search", require("./modules/search"));

// store manifest endpoint
// the game (Steam) also requires this to use DLC
api.get('/store/song_manifest/get/', (req, res) => {
    res.json({results: {
        "release_id": "week43",
        "release_date": "2021-12-02",
        // TODO: include copies of the dlcmanifest.pak asset
        ps_asset_download_url:  `${config.host_url}/static/ps_store_asset.bin`,
        xbox_asset_download_url:  `${config.host_url}/static/xbox_store_asset.bin`,
        pc_asset_download_url: `${config.host_url}/static/pc_store_asset.bin`,
        switch_asset_download_url: `${config.host_url}/static/switch_store_asset.bin`,
        version: 738126010, // the version of the DLC manifest - this is latest from official servers
        // list of valid shortnames for songs
        songs: [
            "youngdumbandbroke","buddyholly","juice","whineup",
            "lococontigo","higher","mood","mrbrightside","concalma",
            "superfreak","whatspoppin","bop","adoreyou","xotourllif3",
            "tubthumping","apache","gentleonmymind","maskoff","kissandmakeup",
            "shouldistayorshouldigo","babyimjealous","newrules","venus",
            "grooveisintheheart","rosesimanbek","alittlerespect","alot",
            "sevennationarmy","ily","circles","whatifs","holdingoutforahero",
            "unforgettable","fridayiminlove","breakingme","feelssogood",
            "letslove","herecomesthehotstepper","livinlavidaloca",
            "takeovercontrol","insideout","myheadandmyheart","gravelpit","megusta",
            "onething","kingsandqueens","rockyourbody","happier","crankdat",
            "weliketoparty","norolemodelz","takeyoudancing","nothingbreakslikeaheart",
            "bringmetolife","stronger","maps","iloveit","wherethemgirlsat","golden",
            "murdershewrote","imeltwithyou","linger","trapqueen","whoompthereitis",
            "unbelievable","daysahead","toomuch","boombastic","djgotusfallinginlove",
            "ironic","lookwhatyouvedone","thebusiness","lipslikesugar","manoftheyear",
            "starships","poison","numb","fireburning","lifeisahighway","thereforeiam",
            "low","funkycoldmedina","countingstars","sandstorm","cradles","getbusy",
            "montero","animals","redlights","thenightporter","dancingsnotacrime",
            "latch","unanochemas","taintedlove","lowrider","sourcandy","alwaysontime",
            "dontyoudare","daysgoby","followyou","yourlove9pm","pidelimon","whatislove",
            "myexsbestfriend","shookonesptii","lights","looppack01","amongtheliving",
            "selfesteem","savage","renegades","dreams","maneater","thegamegotyou",
            "smokeonthewater","looppack11","wellerman","leavealittlelove","hiphophooray",
            "looppack12","burningdownthehouse","thisishow","astronautintheocean",
            "headandheart","walkingonsunshine","levitating","royceplease","looppack07",
            "rumors","stay","shedrivesmecrazy","crystalbeach","imgonnabe"
        ]}});
});

// main menu promotions
api.get('/main_menu/promotions/get_active/', (req, res) => {
    res.json({ results: {
        promotions: [{
            promotion_id: 69,
            name: "Welcome to ReFused!",
            extra_text: "https://github.com/InvoxiPlayGames/ReFused",
            message: "This is a placeholder announcement for the ReFused revival server project.",
            promotion_type: "elder_credit_score", // also valid: "event", "challenge", "recording", "dlc"
            image_download_url: null,
            image_medium_download_url: null,
            image_small_download_url: null,
            event: null,
            recording: null,
            dlc: null,
            bundled_dlc: []
        }]
    }})
});

// for the telemetry endpoints, we don't care
api.all('/bi/events/:event/', (req, res) => {
    res.end();
});

// the game gets really mad and spammy when you don't provide this, for the diamond stage and other such events
// so make a fake endpoint
api.get('/nop/', (req, res) => {
    res.json({ results: { status: "ok"} });
});
api.all('/main_stage/refresh_urls/', (req, res) => {
    res.json({ results: {
        current_event_url: `${config.host_url}/api/nop/?from=current_event_url`,
        events_url: `${config.host_url}/api/nop/?from=events_url`,
        headliners_url: `${config.host_url}/api/nop/?from=headliners_url`,
        latest_spectators: `${config.host_url}/api/nop/?from=latest_spectators`,
        next_event_url: `${config.host_url}/api/nop/?from=next_event_url`,
    }});
});

// prepare the database
startDB();

// assign the API to the root app and listen on port 8080
app.use("/api", api);
app.use("/static", express.static(config.static_path));
app.use("/uploads", require("./modules/uploads"));
app.listen(8080);
