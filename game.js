const fs = require('fs');
const utils = require("./utils.js");
const aliases = JSON.parse(fs.readFileSync("./aliases.json", {encoding: "utf-8"}));
module.exports.start = (client, message) => {
    let fishData = JSON.parse(fs.readFileSync("./fish.json", {encoding: "utf-8"}));
    let params = message.content.split(/\s+/g);
    if (params.length > 1 && fishData.games.hasOwnProperty(params[1])) {
        let game = fishData.games[params[1]];
        if (game.owner != message.author.id) {
            message.channel.send("You can't start a game that's not yours, you doofus!");
        } else if (game.players.length % 2 == 1) {
            message.channel.send("You can't start a game that has an odd number of players!");
        } else if (game.players.length < 2) {
            message.channel.send("You must have at least 2 players to start a game!");
        } else if (game.players.length > 8) {
            message.channel.send("You must have no more than 8 players to start a game!");
        } else if (game.active) {
            message.channel.send("You cannot start a game that has already begun!");
        }
        game.active = true;
        game.players = utils.randomShuffle(game.players);
        let deck = [];
        for (let a of "CDHS") {
            for (let b of "A23456789TJKQ") {
                deck.push(b + a);
            }
        }
        deck.push("R*");
        deck.push("B*");
        console.log(deck);
        deck = utils.randomShuffle(deck);
        for (i = 0; i < deck.length; i++) {
            game.hands[i % game.players.length].push(deck[i]);
        }
        console.log(game.hands);
        fLog.send(`Game ${params[1]} has begun!`);
        gameLog.send(`Game ${params[1]} has begun!`);
        let team1 = "", team2 = "";
        let users = [];
        for (i = 0; i < game.players.length; i++) {
            users.push(client.users.get(game.players[i]));
        }
        for (i = 0; i < game.players.length; i++) {
            let teammates = [];
            for (j = i % 2; j < game.players.length; j += 2) {
                if (j == i) continue;
                teammates.push(`${users[j].username}#${users[j].discriminator}`);
            }
            if (teammates.length > 0) users[i].send(`Your teammates are:\n${teammates.join(", ")}`);
            let hand = "Your hand consists of:\n"
            for (j = 0; j < game.hands[i].length; j++) {
                let card = game.hands[i][j];
                console.log(card);
                if (card.charAt(1) != "*") {
                    hand += `The ${aliases[card.charAt(0)][1]} of ${aliases[card.charAt(1)][1]}\n`;
                } else {
                    hand += `The ${aliases[card.charAt(0)][1]} ${aliases[card.charAt(1)][1]}\n`;
                }
            }
            users[i].send(hand);
        }
        fs.writeFileSync("./fish.json", JSON.stringify(fishData));
    } else if (params.length <= 1) {
        message.channel.send("You doofus, you need to specify a game name!");
    } else if (!fishData.games.hasOwnProperty(params[1])) {
        message.channel.send("You can't start a game that doesn't exist, doofus.");
    }
}