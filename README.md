# ReFused

## VERY WORK IN PROGRESS!

A recreation of Harmonix's Fuser Web Services API, written in Node.js, to preserve the functionality of the game post-shutdown.

**DISCLAIMER: NOT A LOT OF THINGS ARE IMPLEMENTED, RUNNING THIS IN ITS CURRENT STATE IS UNSTABLE!**

## Connecting to the test server

Open `%localappdata%\Fuser\Saved\Config\WindowsNoEditor\Game.ini` in a text editor, and add the following lines:
```ini
[/Script/Hype.BackendServerMgrSettings]
EnvironmentSettings=((Live, (ClientURL="https://refusedapi.ipg.pw/api/")))
```

This server is in a testing state and is not guaranteed to be up 24/7 nor guaranteed to be stable. If you're running your own instance, replace the ClientURL with the publicly accessible URL of the server (as well as in `config.json` on your server)

## Supported

* Allows for Steam, Epic and Nintendo login.
    * Allows Steam users to play the DLC that they own.
* Basic mix upload/download functionality.
* Searching for other users by username and viewing their profile and mixes.

## TODO

* A stub version of the Diamond Store to allow unlocking every single item.
* Favouriting mixes.
* Importing mixes and other data saved from the original servers.
* Compressing images upon upload to save on server space.
* Functionally granting Diamonds to users for levelling up.
* Following users.
* Delivering data from custom songs to users for listening in mixes.
* Co-op freestyles and battles support.
    * Static analysis might be required.
    * I'm missing captures of battles.
    * Original servers uses AWS Gamelift. :(
* Functional Diamond Store rotation (retaining the option to allow users to unlock everything)
* Pull notifications for follows, mix upvotes, etc.
* Login support for Switches that are locked offline.
