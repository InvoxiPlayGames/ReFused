# ReFused

## VERY WORK IN PROGRESS!

A recreation of Harmonix's Fuser Web Services API, written in Node.js, to preserve the functionality of the game post-shutdown.

**DISCLAIMER: NOT A LOT OF THINGS ARE IMPLEMENTED, RUNNING THIS IN ITS CURRENT STATE IS UNSTABLE!**

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
