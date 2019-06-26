const fs = require("fs");
const config = JSON.parse(fs.readFileSync("./config.json", {encoding: "utf-8"}));

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