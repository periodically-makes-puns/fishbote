const discord = require("discord.js");
const fs = require("fs");
const commands = JSON.parse(fs.readFileSync("./help.json"));
module.exports = (client, message) => {
    
    let helpReq = message.content.split(/\s+/g);
    let embed = new discord.RichEmbed();
    embed.setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL).setColor("#3daeff").setTimestamp(new Date()).setFooter("Made by PMP#5728.");
    if (helpReq.length > 1) {
        if (commands.hasOwnProperty(helpReq[1])) {
            console.log("a");
            let command = commands[helpReq[1]];
            embed.setTitle(command.command);
            let desc = command.description + "\n\n";
            desc += "**Parameters**\n"
            for (let a of command.required) {
                desc += `**${a}**: ${command.params[a]}\n`;
            }
            for (let a of command.optional) {
                desc += `*${a}*: ${command.params[a]}\n`;
            }
            desc += "\n*Bolded parameters are required. Italicised parameters are optional or only sometimes required.*\n"
            desc += "\n**Examples**\n";
            for (let a of command.examples) {
                desc += `${a}\n`;
            }
            embed.setDescription(desc);
        } else {
            console.log('b');
            embed.setTitle("That doesn't bloody exist!").setDescription("That's not a command.");
        }
    } else {
        console.log("c");
        embed.setTitle("Fishbote Help Documents");
        desc = "Fishbote is a bot designed to run games of Fish.\n\n**Commands**\n";
        for (let a in commands) {
            desc += `${commands[a].command}\n`;
        }
        desc += "\nThis bot was programmed by PMP#5728. Contact him for more help and information, or use the f!help command.";
        embed.setDescription(desc);
    }
    message.channel.send(embed);
}