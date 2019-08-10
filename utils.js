const fs = require("fs");
const config = JSON.parse(fs.readFileSync("./config.json", {encoding: "utf-8"}));
const aliases = JSON.parse(fs.readFileSync("./aliases.json", {encoding: "utf-8"}));

module.exports.search = (client, name) => {
    let user = client.users.get(name);
    if (typeof user != "undefined") {
        return user;
    }
    let aliases = JSON.parse(fs.readFileSync("./aliases.json", {encoding: "utf-8"}));
    if (aliases.users.hasOwnProperty(name)) {
        return client.users.get(aliases.users[name]);
    }
    user = client.users.find(user => user.username == name);
    if (typeof user != "undefined") {
        return user;
    }
    user = client.guilds.get(config.server).members.find(user => user.nickname == name);
    if (typeof user != "undefined") {
        return user;
    }
}

module.exports.randomShuffle = (array) => {
    let temp, j;
    for (let i = array.length - 1; i > 0; i--) {
        temp = array[i];
        j = Math.floor(Math.random() * (i+1));
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

module.exports.addUser = (fishData, user) => {
    if (fishData.users.hasOwnProperty(user.id)) return fishData;
    fishData.users[user.id] = {
        "activeGames": [],
        "wins": 0,
        "losses": 0,
        "suitsFor": 0,
        "suitsAgainst": 0,
        "pastGames": [],
    }
    return fishData;
}

module.exports.joinGame = (fishData, user, gameName) => {
    fishData.users[user].activeGames.push(gameName);
    return fishData;
}

module.exports.leaveGame = (fishData, user, gameName) => {
    fishData.users[user].activeGames.splice(fishData.users[user].activeGames.indexOf(gameName), 1);
    return fishData;
}

module.exports.deleteGame = (fishData, game) => {
    for (let i = 0; i < fishData.games[game].players.length; i++) {
        console.log(fishData.games[game].players[i]);
        console.log(fishData.users);
        fishData = this.leaveGame(fishData, fishData.games[game].players[i], game);
    }
    return fishData;
}

module.exports.printHand = (game, i) => {
    let hand = "";
    for (j = 0; j < game.hands[i].length; j++) {
        let card = game.hands[i][j];
        console.log(card);
        if (card.charAt(1) != "*") {
            hand += `${aliases[card.charAt(0)][0]}${aliases[card.charAt(1)][1]}\n`;
        } else {
            hand += `The ${aliases[card.charAt(0)][1]} ${aliases[card.charAt(1)][1]}\n`;
        }
    }
    return hand;
}

sortOrder = {
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

function comp(card1, card2) {
    return sortOrder[card1] - sortOrder[card2];
}

module.exports.sortHand = (hand) => {
    hand.sort(comp);
    return hand;
}