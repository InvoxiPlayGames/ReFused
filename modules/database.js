const config = require("../config.json");

// initialise the sequelize ORM according to the config
const { Sequelize } = require('sequelize');
const { Op, DataTypes } = Sequelize;
var Database = new Sequelize(config.sequelize);

var Players = Database.define('players', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    creation_time: { type: DataTypes.DATE },
    // the unique name given to the user on account creation
    hype_username: { type: DataTypes.STRING },
    // the platform information for the user
    platform_enum: { type: DataTypes.INTEGER },
    platform_user_id: { type: DataTypes.STRING },
    platform_username: { type: DataTypes.STRING },
    crossplay_enabled: { type: DataTypes.BOOLEAN },
    // system stuff
    banned: { type: DataTypes.BOOLEAN },
    elder_credit_count: { type: DataTypes.INTEGER },
    last_seen: { type: DataTypes.DATE },
    total_credits: { type: DataTypes.INTEGER },
    // the filename URLs for the player's data
    avatar_filename: { type: DataTypes.STRING },
    profile_pic_filename: { type: DataTypes.STRING },
    // the information provided in /xp/ updates
    starting_xp: { type: DataTypes.INTEGER }, // keep the XP of the user when they first login
    xp: { type: DataTypes.INTEGER },
    highest_rank: { type: DataTypes.INTEGER },
    highest_tier: { type: DataTypes.INTEGER },
    num_discs: { type: DataTypes.INTEGER },
    streak_loss_count: { type: DataTypes.INTEGER },
    streak_win_count: { type: DataTypes.INTEGER },
    total_battle_wins: { type: DataTypes.INTEGER },
    total_battle_losses: { type: DataTypes.INTEGER },
});

var Recordings = Database.define('recordings', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    player_id: { type: DataTypes.INTEGER },
    mix_name: { type: DataTypes.STRING },
    creation_time: { type: DataTypes.DATE },
    // the data given in the upload json
    included_songs_json: { type: DataTypes.STRING },
    meta_data_json: { type: DataTypes.STRING },
    venue_name: { type: DataTypes.STRING },
    venue_time_of_day: { type: DataTypes.STRING },
    // the filenames for the mix upload
    asset_filename: { type: DataTypes.STRING },
    thumbnail_filename: { type: DataTypes.STRING },
    campaign_mission: { type: DataTypes.STRING },
    challenge_id: { type: DataTypes.INTEGER },
    recording_client_id: { type: DataTypes.STRING },
});

var MenuPromotions = Database.define('menu_promotions', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // the date and whether it should be displayed
    creation_time: { type: DataTypes.DATE },
    should_display: { type: DataTypes.BOOLEAN },
    display_priority: { type: DataTypes.INTEGER },
    // the data to display on the main page
    name: { type: DataTypes.STRING },
    message: { type: DataTypes.STRING },
    extra_text: { type: DataTypes.STRING },
    image_url: { type: DataTypes.STRING },
    // what type of promotion it is and whether to display it elsewhere
    promotion_type: { type: DataTypes.STRING },
    dlc_id: { type: DataTypes.INTEGER },
    event_id: { type: DataTypes.INTEGER },
    recording_id: { type: DataTypes.INTEGER },
    bundled_dlc_json: { type: DataTypes.STRING },
});

var Songs = Database.define('songs', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    shortname: { type: DataTypes.STRING },
    uuid: { type: DataTypes.STRING },
    // display metadata
    title: { type: DataTypes.STRING },
    genre_id: { type: DataTypes.INTEGER },
    artist_id: { type: DataTypes.INTEGER },
    artist_name: { type: DataTypes.STRING },
    release_year: { type: DataTypes.INTEGER },
    // flags for whether it's DLC or a custom song
    is_dlc: { type: DataTypes.BOOLEAN },
    is_custom: { type: DataTypes.BOOLEAN },
    // base URLs for assets (relative to host)
    pc_url_base: { type: DataTypes.STRING },
    xbox_url_base: { type: DataTypes.STRING },
    ps_url_base: { type: DataTypes.STRING },
    switch_url_base: { type: DataTypes.STRING },
    // offer IDs
    steam_offer: { type: DataTypes.STRING },
    epic_offer: { type: DataTypes.STRING },
    switch_offer: { type: DataTypes.STRING },
    xbox_offer: { type: DataTypes.STRING },
    psn_offer: { type: DataTypes.STRING },
    // the date the DLC was released (or custom was added to the server)
    release_date: { type: DataTypes.STRING },
});

var DiamondStoreItems = Database.define('diamond_items', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.STRING },
    asset: { type: DataTypes.STRING }
});

var DiamondStoreUnlocks = Database.define('diamond_unlocks', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    player_id: { type: DataTypes.INTEGER },
    type: { type: DataTypes.STRING },
    asset: { type: DataTypes.STRING }
});

var Relationships = Database.define('relationships', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    from_player_id: { type: DataTypes.INTEGER },
    to_player_id: { type: DataTypes.INTEGER },
    is_block: { type: DataTypes.BOOLEAN },
});

module.exports = { Database, Players, Recordings, MenuPromotions, Songs, DiamondStoreItems, DiamondStoreUnlocks, Relationships, startDB: () => {
    Database.authenticate();
    Players.sync();
    Recordings.sync();
    MenuPromotions.sync();
    Songs.sync();
    DiamondStoreItems.sync();
    DiamondStoreUnlocks.sync();
    Relationships.sync();
} };
