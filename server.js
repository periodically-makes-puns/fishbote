const discord = require("discord.js");
const client = new discord.Client();
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("./config.json", {encoding: "utf-8"}));
const help = require("./help.js");
const fishEngine = require("./fish.js");
const gameEngine = require("./game.js");
const actionEngine = require("./actions.js");
client.on("ready", () => {
    // initialise channels and server
    // for ease of logging
    global.server = client.guilds.get(config.server); 
    global.mLog = client.channels.get(config.channels.messageLog);
    global.fLog = client.channels.get(config.channels.fishLog);
    global.rLog = client.channels.get(config.channels.reasonLog);
    global.gameLog = client.channels.get(config.channels.gameLog);
    global.fishCategory = client.channels.get(config.channels.fishCategory);
    global.turnTime = config.turnTime * 1000;    
    // log channel and server
    console.log("Active on server " + server.name);
    console.log("Logging messages to #" + mLog.name);
    console.log("Logging fish data to #" + fLog.name);
    console.log("Logging moderation data to #" + rLog.name);
});

client.on("message", (message) => {
    let fishData = JSON.parse(fs.readFileSync("./fish.json", {encoding: "utf-8"}));
    if (!message.author.bot) {

        // log messages
        if (message.channel.type != "dm") {
            mLog.send(message.author.username + "#" + message.author.discriminator + ", in channel <#" + message.channel.id + "> said: \n```" + message.content + '```');
        } else {
            mLog.send(message.author.username + "#" + message.author.discriminator + ", in DMs said: \n```" + message.content + "```");
        }
        let ind = fishData.outstandingConfirmations.indexOf(message.author.id);
        if (ind != -1) {
            if (message.content == "Y" || message.content == "y") {
                let params = fishData.confirmations[message.author.id].split(/\s+/g);
                switch (params[0]) {
                    case "delete":
                        actionEngine.delete(client, message, params[1]);
                        break;
                    case "join":
                        actionEngine.join(client, message, params[1], params[2]);
                        break;
                }
                fishData = JSON.parse(fs.readFileSync("./fish.json", {encoding: "utf-8"}));
                fishData.outstandingConfirmations.splice(ind, 1);
                fishData.confirmations[message.author.id] = undefined;
                fs.writeFileSync("./fish.json", JSON.stringify(fishData));
            } else if (message.content == "N" || message.content == "n") {
                let params = fishData.confirmations[message.author.id].split(/\s+/g);
                switch (params[0]) {
                    case "delete":
                        actionEngine.noDelete(client, message, params[1]);
                        break;
                    case "join":
                        actionEngine.noJoin(client, message, params[1], params[2]);
                        break;
                }
                fishData.outstandingConfirmations.splice(ind, 1);
                fishData.confirmations[message.author.id] = undefined;
                fs.writeFileSync("./fish.json", JSON.stringify(fishData));
            }
        } else { 
            if (message.content.startsWith("f!")) {
                let command = message.content.substr(2).split(/\s+/g)[0];
                switch (command) {
                    case "help":
                        help(client, message);
                        break;
                    case "init":
                        fishEngine.init(client, message);
                        break;
                    case "invite":
                        fishEngine.invite(client, message);
                        break;
                    case "status":
                        fishEngine.status(client, message);
                        break;
                    case "join":
                        fishEngine.join(client, message);
                        break;
                    case "leave":
                        fishEngine.leave(client, message);
                        break;
                    case "delete":
                        fishEngine.delete(client, message);
                        break;
                    case "alias":
                        actionEngine.alias(client, message);
                        break;
                    case "start":
                        gameEngine.start(client, message);
                        break;
                    case "ask":
                        gameEngine.ask(client, message);
                        break;
                    case "hand":
                        gameEngine.hand(client, message);
                        break;
                    case "list":
                        fishEngine.list(client, message);
                        break;
                }
            }
        }
    }
});


client.login(config.token);