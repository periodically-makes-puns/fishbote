const discord = require("discord.js");
const client = new discord.Client();
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("./config.json", {encoding: "utf-8"}));
const fishData = JSON.parse(fs.readFileSync("./fish.json", {encoding: "utf-8"}));
const userData = JSON.parse(fs.readFileSync("./users.json", {encoding: "utf-8"}));
const help = require("./help.js");
var server;
var mLog;
var fLog;
var rLog;
client.on("ready", () => {
    // initialise channels and server
    server = client.guilds.get(config.server);
    mLog = client.channels.get(config.channels.messageLog);
    fLog = client.channels.get(config.channels.fishLog);
    rLog = client.channels.get(config.channels.reasonLog);

    // log channel and server
    console.log("Active on server " + server.name);
    console.log("Logging messages to #" + mLog.name);
    console.log("Logging fish data to #" + fLog.name);
    console.log("Logging moderation data to #" + rLog.name);
});

client.on("message", (message) => {
    if (!message.author.bot) {

        // log messages
        if (message.channel.type != "dm") {
            mLog.send(message.author.username + "#" + message.author.discriminator + ", in channel <#" + message.channel.id + "> said: \n```" + message.content + '```');
        } else {
            mLog.send(message.author.username + "#" + message.author.discriminator + ", in DMs said: \n```" + message.content + "```");
        }

        if (!message.content.startsWith("f!")) {
            let command = message.content.substr(2).split(/\s+/g)[0];
            switch (command) {
                case "help":
                    help(client, message);
            }
        }

    }
});


client.login(config.token);