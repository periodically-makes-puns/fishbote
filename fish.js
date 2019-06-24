const fs = require("fs");
module.exports.init = (client, message) => {
    let fishData = JSON.parse(fs.readFileSync("./fish.json", {encoding: "utf-8"}));
    let userData = JSON.parse(fs.readFileSync("./users.json", {encoding: "utf-8"}));
    let params = message.content.split(/\s+/g);
    if (params.length > 1 && !fishData.games.hasOwnProperty(params[1])) {
        fishData.games[params[1]] = {
            owner: message.author.id,
            players: [message.author.id],
            public: true,
            hands: [[]],
            declaredLeft: [],
            declaredRight: []
        }
        if (params.length > 2 && params[2] == "private") {
            fishData.games[params[1]].public = false;
        }
    } else if (params.length <= 1) {
        message.channel.send("You doofus, you need to specify a game name!");
    } else {

    }
    fs.writeFileSync("./fish.json", JSON.stringify(fishData));
}

module.exports.invite = (client, message) => {
    
}

module.exports.join = (client, message) => {

}