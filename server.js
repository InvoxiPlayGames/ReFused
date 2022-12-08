const express = require("express");
const app = express();
const api = express();

// parse all incoming data on the API as json, that's what it'll be
api.use(express.json({ strict: true }));

// auth is in the form /api/auth/jwt/ and possibly more
api.post('/auth/:type/', (req, res) => {
    if (req.params.type == "jwt") {
        res.json({ results: {
            token: "test",
            prefix: "JWT",
            user_id: 69,
            encoded_user_id: "sex", // base32 encoded?
            has_profane_name: false,
            token_duration: 120
        }});
    } else {
        res.status(400);
        res.end();
    }
});

// for the owned DLC endpoint, return all the free DLC appids
// the game (Steam) actually requires this to even use the DLC
api.get('/auth/:platform/owned_dlc/', (req, res) => {
    if (req.params.platform == "steam") {
        res.json({ results: {
            // we can fetch these from the steam app ticket
            owned_dlc: [
                1331440, 1497570, 1559220, 1559221, 
                1577430, 1577431, 1588961, 1598244,
                1598247, 1638752, 1644610, 1644614,
                1652860, 1652861, 1652862, 1652863
            ]
        }});
    } else {
        // i have no idea how Epic/NX handles it, maybe an owned_dlc array with strings of the offerIDs i'm assuming?
        res.status(400);
        res.end();
    }
});

// store manifest endpoint
// the game (Steam) also requires this to use DLC
api.get('/store/song_manifest/get/', (req, res) => {
    res.json({results: {
        "release_id": "week43",
        "release_date": "2021-12-02",
        // no idea what these are meant to be
        ps_asset_download_url: null,
        xbox_asset_download_url: null,
        pc_asset_download_url: null,
        switch_asset_download_url: null,
        version: 738126010, // i think this counts for something
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
    res.end();
});

// main menu promotions
api.get('/main_menu/promotions/get_active/', (req, res) => {
    res.json({ results: {
        promotions: [{
            promotion_id: 69,
            name: "Hello World!",
            extra_text: "extra_text",
            message: "Coming to you live from the fake FUSER server!",
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

// ping endpoint
api.get('/players/ping/', (req, res) => {
    res.json({ results: { status: "ok" } });
    res.end();
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
        current_event_url: "http://192.168.0.33:8080/api/nop/?from=current_event_url",
        events_url: "http://192.168.0.33:8080/api/nop/?from=events_url",
        headliners_url: "http://192.168.0.33:8080/api/nop/?from=headliners_url",
        latest_spectators: "http://192.168.0.33:8080/api/nop/?from=latest_spectators",
        next_event_url: "http://192.168.0.33:8080/api/nop/?from=next_event_url",
    }});
});

// assign the API to the root app and listen on port 8080
app.use("/api", api);
app.listen(8080);
