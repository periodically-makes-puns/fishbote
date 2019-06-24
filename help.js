const discord = require("discord.js");
const fs = require("fs");
const commands = JSON.parse(fs.readFileSync("./help.json"));
module.exports = (client, message) => {
    let helpReq = message.content.split(/\s+/g);
    let embed = new discord.RichEmbed();
    if (helpReq.length > 1) {
        if (commands.hasOwnProperty(helpReq[1])) {

        } else {
            embed.setAuthor("PMP#5728").setColor("#3daeff").setTitle("That doesn't bloody exist!").setDescription("That's not a command.")
            message.channel.send("Here.", embed);
        }
    } else {

    }
}