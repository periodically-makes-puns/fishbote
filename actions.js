const fs = require("fs");
const utils = require("./utils.js");

module.exports.delete = (client, message, game) => {
    let fishData = JSON.parse(fs.readFileSync("./fish.json", {encoding: "utf-8"}));
    let history = JSON.parse(fs.readFileSync("./history.json", {encoding: "utf-8"}));
    let name = game + (new Date().getTime());
    history[name] = fishData.games[game];
    history[name].public = undefined;
    history[name].completed = false;
    history[name].active = undefined;
    history[name].turn = undefined;
    fishData = utils.deleteGame(fishData, game);
    fishData.games[game] = undefined;
    message.channel.send(`${game} has been deleted, and its contents written to history.`);
    fLog.send(`${game} has been deleted by ${message.author.username}#${message.author.discriminator}, and its contents written to history.`)
    fs.writeFileSync("./fish.json", JSON.stringify(fishData));
    fs.writeFileSync("./history.json", JSON.stringify(history));
}

module.exports.join = (client, message, gameName, inviter) => {
    let fishData = JSON.parse(fs.readFileSync("./fish.json", {encoding: "utf-8"}));
    let game = fishData.games[gameName];
    if (game == undefined) {
        message.channel.send("You cannot join this game, because it no longer exists.");
    } else if (game.active) {
        message.channel.send("You cannot join this game, because it has already begun!");
    } else if (game.players.indexOf(message.author.id) != -1){
        message.channel.send("You cannot join this game, because *you're already in it.*");
    } else {
        fishData = utils.addUser(fishData, message.author);
        fishData = utils.joinGame(fishData, message.author.id, gameName);
        fishData.games[gameName].players.push(message.author.id);
        fishData.games[gameName].hands.push([]);
        message.channel.send(`You have joined game ${gameName}.`);
        client.users.get(inviter).send(`${message.author.username}#${message.author.discriminator} accepted your invitation to join ${gameName}.`)
        fLog.send(`${message.author.username}#${message.author.discriminator} joined game ${gameName}.`);
        fs.writeFileSync("./fish.json", JSON.stringify(fishData));
    }
}

module.exports.noDelete = (client, message, game) => {
    message.channel.send(`The deletion of ${game} has been canceled.`);
}

module.exports.noJoin = (client, message, game, inviter) => {
    let invit = client.users.get(inviter);
    message.channel.send(`You have declined the invitation of ${invit.username}#${invit.discriminator} to join game ${game}.`);
    invit.send(`${message.author.username}#${message.author.discriminator} has declined your invitation to join ${game}!`);
    let roll = Math.random();
    console.log(roll);
    if (roll < 0.01) {
        invit.send(`You have gained a new Casus Belli against ${message.author.username}#${message.author.discriminator}:\n\nDiplomatic Insult\n\n*Show superiority by winning Fish games.*`);
    }
}

module.exports.alias = (client, message) => {
    let aliases = JSON.parse(fs.readFileSync("./aliases.json", {encoding: "utf-8"}));
    let params = message.content.split(/\s+/g);
    if (params.length > 1 && utils.search(client, params[1]) === null && typeof utils.search(client, params[1]) === "object") {
        aliases.users[params[1]] = message.author.id;
        message.channel.send(`Added alias ${params[1]} for you.`);
        fLog.send(`${params[1]} is now an alias for ${message.author.username}#${message.author.discriminator}.`);
        fs.writeFileSync("./aliases.json", JSON.stringify(aliases));
    } else if (params.length <= 1) {
        message.channel.send("You need to specify an alias, doofus!");
    } else if (aliases.users[params[1]] == message.author.id) {
        aliases.users[params[1]] = undefined;
        message.channel.send(`Removed alias ${params[1]} for you.`);
        fLog.send(`${params[1]} is no longer an alias for ${message.author.username}#${message.author.discriminator}.`);
        fs.writeFileSync("./aliases.json", JSON.stringify(aliases));
    } else if (utils.search(client, params[1]) !== null) {
        let user = utils.search(client, params[1]);
        message.channel.send(`That alias belongs to ${user.username}#${user.discriminator}.`);
    }
}