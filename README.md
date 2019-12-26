# tscdiscord
[tscdiscord](https://github.com/ivanbiljan/tscdiscord) is a multi-purpose Discord chat bot built on top of the [discord.js](https://github.com/discordjs/discord.js) framework using TypeScript.

## Features
* Quote system
* Instagram service
* YouTube API which allows playing music via Discord voice chat (does not require a Google API key)
* Forecasts (TODO)
* Google search (TODO)
* Google image scraping (TODO)
* Reminders (TODO)
* Highlights (TODO)

## Prerequisites
* Node.js 10.2.0 or higher
* node-gyp
* Python v2.7
* ffmpeg

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
    
## Discord setup
Register a new bot at https://discordapp.com/developers. Once done, open `My Application` -> `Bot`, get the bot's token and paste it into `config.json`.

Open `My Application` -> `General Information`. Copy the bot's client ID and paste it into the following URL: https://discordapp.com/api/oauth2/authorize?client_id=[CLIENT_ID]&scope=bot&permissions=[PERMISSIONS]

## Run the application
Run `tsc` followed by `node dist/main.js`
