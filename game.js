const fs = require('fs');
const utils = require("./utils.js");
const aliases = JSON.parse(fs.readFileSync("./aliases.json", {encoding: "utf-8"}));
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A", "R", "B"];
const suits = ["C", "D", "S", "H", "*"];
const sortOrder = {
    "2S": 0,
    "3S": 1,
    "4S": 2,
    "5S": 3,
    "6S": 4,
    "7S": 5,
    "2D": 6,
    "3D": 7,
    "4D": 8,
    "5D": 9,
    "6D": 10,
    "7D": 11,
    "2C": 12,
    "3C": 13,
    "4C": 14,
    "5C": 15,
    "6C": 16,
    "7C": 17,
    "2H": 18,
    "3H": 19,
    "4H": 20,
    "5H": 21,
    "6H": 22,
    "7H": 23,
    "9S": 24,
    "TS": 25,
    "JS": 26,
    "QS": 27,
    "KS": 28,
    "AS": 29,
    "9D": 30,
    "TD": 31,
    "JD": 32,
    "QD": 33,
    "KD": 34,
    "AD": 35,
    "9C": 36,
    "TC": 37,
    "JC": 38,
    "QC": 39,
    "KC": 40,
    "AC": 41,
    "9H": 42,
    "TH": 43,
    "JH": 44,
    "QH": 45,
    "KH": 46,
    "AH": 47,
    "8S": 48,
    "8D": 49,
    "8C": 50,
    "8H": 51,
    "R*": 52,
    "B*": 53,
}
let halfsuits = {"8J": []};
for (let i = 0; i < 4; i++) {
    halfsuits["L" + suits[i]] = [];
    halfsuits["H" + suits[i]] = [];
    for (let j = 0; j < 6; j++) { // low half-suits
        halfsuits["L" + suits[i]].push(ranks[j] + suits[i]);
    }
    for (let j = 0; j < 6; j++) { // high half-suits
        halfsuits["H" + suits[i]].push(ranks[j+7] + suits[i]);
    }
}
halfsuits["8J"].push(["8C", "8D", "8H", "8S", "R*", "B*"]); // 8s and jokers
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
            game.hands[i] = utils.sortHand(game.hands[i]);
            let hand = "Your hand consists of:\n" + utils.printHand(game, i);
            users[i].send(hand);
        }
        let msg = "It is your turn! You may ask the following people for cards:\n";
        for (i = 1; i < game.players.length; i += 2) {
            msg += `[${(i - 1) << 1}] @${users[i].username}#${users[i].discriminator} (ID ${users[i].id})\n`;
        }
        users[0].send(msg);
        fs.writeFileSync("./fish.json", JSON.stringify(fishData));
    } else if (params.length <= 1) {
        message.channel.send("You doofus, you need to specify a game name!");
    } else if (!fishData.games.hasOwnProperty(params[1])) {
        message.channel.send("You can't start a game that doesn't exist, doofus.");
    }
}

module.exports.ask = (client, message) => {
    if (message.channel.type != "dm") {
        message.channel.send("You have to ask in DMs, you doofus!").then((mess) => {
            setTimeout(() => {
                mess.delete();
            }, 5000);
        }).catch((error) => {
            throw error;
        });
        message.delete();
        return;
    }
    let fishData = JSON.parse(fs.readFileSync("./fish.json", {encoding: "utf-8"}));
    let params = message.content.split(/\s+/g);
    if (params.length > 4 && fishData.games.hasOwnProperty(params[1])) {
        let game = fishData.games[params[1]];
        // game person rank suit
        let a = game.players.indexOf(message.author.id);
        if (a == -1) {
            message.channel.send("You aren't part of this game, you doofus!");
            return;
        }
        if (game.turn != a) {
            message.channel.send("It's not your turn!");
            return;
        }
        if (game.fishing !== null) {
            message.channel.send("**Someone is fishing a half-suit! You may not ask while they are fishing!**");
            return;
        }
        let b = utils.search(client, params[2]);
        if (b === null) {
            let n = parseInt(params[2], 10);
            if (n < game.players.length && 0 <= n) {
                b = client.users.get(game.players[2 * n + (1 ^ (a % 2))]);
            } else {
                message.channel.send("Couldn't find anyone by that description.");
                return;
            }
        }
        let c = game.players.indexOf(b.id);
        if (c == -1) {
            message.channel.send("They aren't part of this game, doofus!");
        } else if ((c - a) % 2 == 0) {
            message.channel.send("They're on your team, doofus!");
        } else {
            let rank = params[3];
            let found = false;
            for (let k of ranks) {
                if (aliases[k].indexOf(rank) != -1) {
                    rank = k;
                    found = true;
                    break;
                }
            }
            if (!found) {
                message.channel.send("Woah there, we couldn't identify the rank you typed in.");
                return;
            }
            let suit = params[4];
            found = false;
            for (let k of suits) {
                console.log(aliases[k]);
                if (aliases[k].indexOf(suit) != -1) {
                    suit = k;
                    found = true;
                    break;
                }
            }
            if (!found) {
                message.channel.send("Woah there, we couldn't identify the suit you typed in.");
                return;
            }
            let card = rank + suit;
            if (!sortOrder.hasOwnProperty(card)) {
                message.channel.send("That card doesn't exist, you doofus!");
                return;
            }
            if (game.hands[a].indexOf(card) != -1) {
                message.channel.send("That's in your hand, you doofus!");
                return;
            }
            let d = game.hands[c].indexOf(card);
            if (d == -1) {
                message.channel.send(`They do not have the ${aliases[rank][0]} ${aliases[suit][1]}.`).then(m => {
                    setTimeout(() => {
                        m.delete();
                    }, turnTime);
                });
                b.send(`${message.author.username} asked for ${aliases[rank][0]} ${aliases[suit][1]}. You didn't have it.`).then(m => {
                    setTimeout(() => {
                        m.delete();
                    }, turnTime);
                });
                client.channels.get(game.channel).send(`${message.author.username} asked ${b.username} for the card ${aliases[rank][0]} ${aliases[suit][1]}. They did not have the card.`).then(m => {
                    setTimeout(() => {
                        m.delete();
                    }, turnTime);
                });
                game.turn = c;
            } else {
                message.channel.send(`You have taken the ${aliases[rank][0]} ${aliases[suit][1]}.`).then(m => {
                    setTimeout(() => {
                        m.delete();
                    }, turnTime);
                });
                b.send(`${message.author.username} took your ${aliases[rank][0]} ${aliases[suit][1]}!`).then(m => {
                    setTimeout(() => {
                        m.delete();
                    }, turnTime);
                });
                game.hands[c].splice(d, 1);
                game.hands[a].push(card);
                game.hands[a] = utils.sortHand(game.hands[a]);
                client.channels.get(game.channel).send(`${message.author.username} asked ${b.username} for the card ${aliases[rank][0]} ${aliases[suit][1]}. They had the card!`);
            }
            game.queries.push([message.author.id, b.id, card, d != -1]);
            fs.writeFileSync("./fish.json", JSON.stringify(fishData));
        }
    } else if (params.length <= 4) {
        message.channel.send("You utter doofus, I need 4 parameters; No more, no less!");
    } else {
        message.channel.send("That game doesn't bloody exist, ya doofus!");
    }  
}

module.exports.hand = (client, message) => {
    if (message.channel.type != "dm") {
        message.channel.send("You gotta ask in DMs, you doofus!").then(m => {
            setTimeout(() => {
                m.delete();
            }, 5000);
        });
        message.delete();
        return;
    }
    let fishData = JSON.parse(fs.readFileSync("./fish.json", {encoding: "utf-8"}));
    let params = message.content.split(/\s+/g);
    if (params.length > 1 && fishData.games.hasOwnProperty(params[1])) {
        let game = fishData.games[params[1]];
        let a = game.players.indexOf(message.author.id);
        if (!game.active) {
            message.channel.send("The game hasn't started, you doofus!");
            return;
        }
        if (a == -1) {
            message.channel.send("You're not in this game, you doofus!");
            return;
        }
        if (game.hands[a].length == 0) {
            message.channel.send("Your hand is empty!");
        } else {
            message.channel.send("Your hand consists of: " + utils.printHand(game, a));
        }
    } else if (params.length <= 1) {
        message.channel.send("Which game are you asking for, you doofus?");
    } else {
        message.channel.send("That game doesn't exist, you doofus!");
    }
}


module.exports.fish = (client, message) => {
    let fishData = JSON.parse(fs.readFileSync("./fish.json", {encoding: "utf-8"}));
    let params = message.content.split(/\s+/g);
    if (params.length > 2 && fishData.games.hasOwnProperty(params[1])) {
        let game = fishData.games[params[1]];
        let a = game.players.indexOf(message.author.id);
        if (a == -1) {
            message.channel.send("You aren't in this game, you doofus!");
            return;
        }
        let b = -1;
        let halfsuit = params[3];
        let found = false;
        for (let k in halfsuits) {
            if (aliases[k].indexOf(halfsuit) != -1) {
                rank = k;
                found = true;
                break;
            }
        }
        if (!found) {
            message.channel.send("Woah there, we couldn't identify the halfsuit you typed in.");
            return;
        }
        if (!halfsuits.hasOwnProperty(halfsuit)) {
            message.channel.send("Woah there, that's not a valid halfsuit.");
            return;
        }
        message.channel.send("**Are you sure you wish to fish? Reply Y or N.**");
        fishData.outstandingConfirmations.push(message.author.id);
        fishData.confirmations[message.author.id] = message.content.substr(2);
    } else if (params.length <= 2) {
        message.channel.send("Not enough parameters.");
    } else {
        message.channel.send("That game doesn't exist, you doofus!");
    }
}