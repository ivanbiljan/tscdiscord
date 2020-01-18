# tscdiscord
[![Build Status](https://travis-ci.com/ivanbiljan/tscdiscord.svg?token=rvj6EvJ5BXdebUHHysAV&branch=master)](https://travis-ci.com/ivanbiljan/tscdiscord) [![GitHub license](https://img.shields.io/github/license/ivanbiljan/tscdiscord.svg)](https://github.com/ivanbiljan/tscdiscord/blob/master/LICENSE) [![IssuesOpen](https://img.shields.io/github/issues/ivanbiljan/tscdiscord.svg)](https://github.com/ivanbiljan/tscdiscord/issues) [![PullRequests](https://img.shields.io/github/issues-pr/ivanbiljan/tscdiscord.svg)](https://github.com/ivanbiljan/tscdiscord/pulls)

[tscdiscord](https://github.com/ivanbiljan/tscdiscord) is a multi-purpose Discord chat bot built on top of the [discord.js](https://github.com/discordjs/discord.js) framework using TypeScript.

## Features
* Regex based command matching
* Quotes
* Instagram service
* YouTube API which allows playing music via Discord voice chat (does not require a Google API key)
* Forecasts (current, weekly)
* Game tracking (CSGO, Fortnite, Apex)
* Google search (TODO)
* Google image scraping (TODO)
* Reminders 
* Highlights (TODO)

## Prerequisites
* Node.js 10.2.0 or higher
* node-gyp
* Python v2.7 or higher
* ffmpeg
* Redis

## Installation
* Configure TypeScript if necessary: `npm install [-g] typescript`
* Install `node-gyp`: `npm install [-g] node-gyp`
* Install `windows-build-tools`: `npm install [-g] windows-build-tools`
* Install the `ffmpeg` library:
  * On **Windows 10**:
      - Download the latest stable build from [here](https://ffmpeg.zeranoe.com/builds/)
      - Extract the zip file 
      - Add `C:\ffmpeg\bin` to your system path
  * On **(WSL) Ubuntu**:
    ```console
    sudo apt-get update
    sudo apt-get install ffmpeg
    ```
* Install `redis-server`:
  * On **Windows 10**:
      - Pick a release from [Redis' release page](http://download.redis.io/releases/)
      - Unpack the file and run the setup
  * On **(WSL) Ubuntu**:
    ```console
    sudo apt-get install redis-server
    ```
## Discord setup
Register a new bot at https://discordapp.com/developers. Once done, open `My Application` -> `Bot`, get the bot's token and paste it into a `.env`.

Open `My Application` -> `General Information`. Copy the bot's client ID and paste it into the following URL: https://discordapp.com/api/oauth2/authorize?client_id=[CLIENT_ID]&scope=bot&permissions=[PERMISSIONS]

## Run the application
```shell
# Install dependencies
npm install

# Build the project
npm run tsc

# Run the app
npm start
```

## License
This project is distributed under the [MIT License](https://en.wikipedia.org/wiki/MIT_License), see [LICENSE](https://github.com/ivanbiljan/tscdiscord/blob/master/LICENSE) for more details.
