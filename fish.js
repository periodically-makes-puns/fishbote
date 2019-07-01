const fs = require("fs");
const utils = require("./utils.js");
module.exports.init = (client, message) => {
    let fishData = JSON.parse(fs.readFileSync("./fish.json", {encoding: "utf-8"}));
    let params = message.content.split(/\s+/g);
    if (params.length > 1 && !fishData.games.hasOwnProperty(params[1])) {
        params[1] = params[1].trim();
        if (params[1].length < 2) {
            message.channel.send("Your game name must be at least 2 characters long!");
        } else {
            console.log(params[3]);
            fishData = utils.addUser(fishData, message.author);
            fishData.games[params[1]] = {
                owner: message.author.id,
                players: [message.author.id],
                public: true,
                active: false,
                turn: 0,
                hands: [[]],
                declaredLeft: [],
                declaredRight: [],
                queries: [],
                maxPlayers: parseInt(params[3], 10) || 8,
            }
            fishData.games[params[1]].maxPlayers = Math.max(Math.min(fishData.games[params[1]].maxPlayers, 8), 4);
            if (params.length > 2 && params[2] == "private") {
                fishData.games[params[1]].public = false;
            }
            message.channel.send(`Created new game ${params[1]} with${(fishData.games[params[1]].public) ? "" : "out"} public joining and with a maximum of ${fishData.games[params[1]].maxPlayers} players.`);
            fLog.send(`${message.author.username}#${message.author.discriminator} just created a new game called ${params[1]} with${(fishData.games[params[1]].public) ? "" : "out"} public joining and with a maximum of ${fishData.games[params[1]].maxPlayers} players.`);
            fs.writeFileSync("./fish.json", JSON.stringify(fishData));
        }
    } else if (params.length <= 1) {
        message.channel.send("You doofus, you need to specify a game name!");
    } else {
        message.channel.send("A game of that name already exists.");
    }
}

module.exports.invite = (client, message) => {
    let fishData = JSON.parse(fs.readFileSync("./fish.json", {encoding: "utf-8"}));
    let params = message.content.split(/\s+/g);
    if (params.length > 2 && fishData.games.hasOwnProperty(params[2]) && fishData.games[params[2]].owner == message.author.id) {
        let game = fishData.games[params[2]];
        if (game.players.length == game.maxPlayers) {
            message.channel.send("Sorry, but this game is full.");
        }
        let user = utils.search(client, params[1]);
        if (user === null && typeof user === "object") {
            message.channel.send("We couldn't find that person. Try using their ID, username, nickname on the Fishery server, or any aliases they have.");
            return;
        }
        if (fishData.games[params[2]].players.indexOf(user.id) != -1) {
            message.channel.send("You can't invite someone that's already in the game, you doofus!");
            return;
        }
        if (fishData.outstandingConfirmations.indexOf(user.id) != -1) {
            message.channel.send('Sorry, but this person currently has an outstanding confirmation they need to answer. Please try again later.');
            return;
        }
        user.send(`You have been invited by ${message.author.username}#${message.author.discriminator} to join game ${params[2]}. Join (Y/n)?`);
        user.send("No commands to this bot will be accepted from you while no Y or N has been given.");
        fishData.outstandingConfirmations.push(user.id);
        fishData.confirmations[user.id] = `join ${params[2]} ${message.author.id}`;
        fLog.send(`An invitation to join the game ${params[2]} has been lodged by ${message.author.username}#${message.author.discriminator} for ${user.username}#${user.discriminator}.`);
        fs.writeFileSync("./fish.json", JSON.stringify(fishData));
    } else if (params.length <= 2) {
        message.channel.send("You need to specify both a person and game name, doofus!");
    } else if (fishData.games.hasOwnProperty(params[2])) {
        message.channel.send("That game doesn't exist, doofus!");
    } else if (fishData.games[params[1]].owner != message.author.id) {
        message.channel.send("You can't invite players if you're not the owner, doofus!");
    }
}

module.exports.join = (client, message) => {
    let fishData = JSON.parse(fs.readFileSync("./fish.json", {encoding: "utf-8"}));
    let params = message.content.split(/\s+/g);
    if (params.length > 1 && fishData.games.hasOwnProperty(params[1])) {
        let game = fishData.games[params[1]];
        if (game.active) {
            message.channel.send("You cannot join this game, because it has already begun!");
        } else if (game.players.indexOf(message.author.id) != -1){
            message.channel.send("You cannot join this game, because *you're already in it.*");
        } else if (!game.public && game.owner != message.author.id) {
            message.channel.send("The owner of this game has turned off public joining, so you gotta be *invited*.");
        } else if (game.players.length == game.maxPlayers) {
            message.channel.send("Sorry, but this game is full.");
        } else {
            fishData = utils.addUser(fishData, message.author);
            fishData = utils.joinGame(fishData, message.author.id, params[1]);
            game.players.push(message.author.id);
            game.hands.push([]);
            message.channel.send(`You have joined game ${params[1]}.`);
            fLog.send(`${message.author.username}#${message.author.discriminator} joined game ${params[1]}.`);
            fs.writeFileSync("./fish.json", JSON.stringify(fishData));
        }
    } else if (params.length <= 1) {
        message.channel.send("You need to specify a game name, doofus!");
    } else {
        message.channel.send("That game doesn't exist, doofus!");
    }
}

module.exports.leave = (client, message) => {
    let fishData = JSON.parse(fs.readFileSync("./fish.json", {encoding: "utf-8"}));
    let params = message.content.split(/\s+/g);
    if (params.length > 1 && fishData.games.hasOwnProperty(params[1])) {
        let game = fishData.games[params[1]];
        if (game.active) {
            message.channel.send("You cannot leave this game, because it has already begun!");
        } else if (game.players.indexOf(message.author.id) == -1){
            message.channel.send("You cannot leave this game, because *you're not in it.*");
        } else {
            fishData = utils.leaveGame(fishData, message.author.id, params[1])
            game.hands.splice(game.players.indexOf(message.author.id), 1);
            game.players.splice(game.players.indexOf(message.author.id), 1);
            message.channel.send(`You have left game ${params[1]}.`);
            fLog.send(`${message.author.username}#${message.author.discriminator} left game ${params[1]}.`);
            fs.writeFileSync("./fish.json", JSON.stringify(fishData));
        }
    } else if (params.length <= 1) {
        message.channel.send("You need to specify a game name, doofus!");
    } else {
        message.channel.send("That game doesn't exist, doofus!");
    }
}

module.exports.status = (client, message) => {
    let fishData = JSON.parse(fs.readFileSync("./fish.json", {encoding: "utf-8"}));
    let params = message.content.split(/\s+/g);
    if (params.length > 1 && fishData.games.hasOwnProperty(params[1])) {
        let game = fishData.games[params[1]];
        let report = `**Game name**: ${params[1]}\n\n`;
        
        if (game.active) {
            report += "**Team 1**:\n";
            for (let i = 0; i < game.players.length; i += 2) {
                let p = game.players[i];
                report += client.users.get(p).username + "#" + client.users.get(p).discriminator + ` (${game.hands[i].length} card${(game.hands[i].length == 1) ? '' : "s"})\n`;
            }
            report += "\n**Team 2**:\n";
            for (let i = 1; i < game.players.length; i += 2) {
                let p = game.players[i];
                report += client.users.get(p).username + "#" + client.users.get(p).discriminator + ` (${game.hands[i].length} card${(game.hands[i].length == 1) ? '' : "s"})\n`;
            }
            report += "\n**Status**: In Game\n\n";
            report += "**Team 1 Halfsuits**: ";
            for (let i = 0; i < game.declaredLeft.length; i++) {
                report += aliases[game.declaredLeft[i]][1];
                if (i != game.declaredLeft.length - 1) report += ", ";
            }
            if (game.declaredLeft.length == 0) report += "None.";
            report += ` **[${game.declaredLeft.length}]**`;
            report += "\n**Team 2 Halfsuits**: ";
            for (let i = 0; i < game.declaredRight.length; i++) {
                report += aliases[game.declaredRight[i]][1];
                if (i != game.declaredRight.length - 1) report += ", ";
            }
            if (game.declaredRight.length == 0) report += "None.";
            report += ` **[${game.declaredRight.length}]**`;
        } else {
            report += "**Players**: \n";
            for (let p of game.players) {
                report += client.users.get(p).username + "#" + client.users.get(p).discriminator + "\n";
            }
            report += "\n**Status**: Waiting for more players\n\n";
        }
        message.channel.send(report);
    } else if (params.length <= 1) {
        message.channel.send("You need to specify a game name, doofus!");
    } else {
        message.channel.send("That game doesn't exist, doofus!");
    }
}

module.exports.delete = (client, message) => {
    let fishData = JSON.parse(fs.readFileSync("./fish.json", {encoding: "utf-8"}));
    let params = message.content.split(/\s+/g);
    if (params.length > 1 && fishData.games.hasOwnProperty(params[1]) && fishData.games[params[1]].owner == message.author.id && !fishData.games[params[1]].active) {
        message.channel.send("Are you sure?\nSend Y to confirm, or N to cancel.");
        fishData.outstandingConfirmations.push(message.author.id);
        fishData.confirmations[message.author.id] = message.content.substr(2);
        fs.writeFileSync("./fish.json", JSON.stringify(fishData));
    } else if (params.length <= 1) {
        message.channel.send("You need to specify a game name, doofus!");
    } else if (!fishData.games.hasOwnProperty(params[1])) {
        message.channel.send("That game doesn't exist, doofus!");
    } else if (fishData.games[params[1]].owner != message.author.id) {
        message.channel.send("You can't delete a game you don't own, doofus!");
    } else {
        message.channel.send("You utter doofus, you can't delete a game that's started already!");
    }
}