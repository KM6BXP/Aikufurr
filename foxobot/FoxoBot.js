var request = require("request");
var Discord = require("discord.js");
var client = new Discord.Client();
var YTDL = require("ytdl-core");
var fs = require("fs");
var htmlparser = require("htmlparser");
var select = require("soupselect").select;
var secret = JSON.parse(fs.readFileSync(require("os").homedir() + "/secret", "utf8"));
var Long = require("long");

var servers = {};

// GLOBALS

global.version = "0.0.24";
global.musicloop = 0;

if (secret.env === "dev") {
    global.defaults = {
        "prefix": "="
    };
}
if (secret.env === "pro") {
    global.defaults = {
        "prefix": "-"
    };
}


if (!fs.existsSync("./FoxoBotData")) {
    fs.mkdirSync("./FoxoBotData");
}


fs.readdir("./FoxoBotData/", function(err, files) {
    //handling error
    if (err) {
        console.log("Unable to scan dir: " + err);
        return
    }
    files.forEach(function(file) {
        var settings = JSON.parse(fs.readFileSync(`./FoxoBotData/${file}`, "utf8"));
        if (!settings.hasOwnProperty("ranks")) {
            settings.ranks = {};
        }
        if (!settings.hasOwnProperty("toggled")) {
            settings.toggled = [];
        }
        if (!settings.hasOwnProperty("prefix")) {
            settings.prefix = global.defaults.prefix;
        }
        if (!settings.hasOwnProperty("welcome")) {
            settings.welcome = 1;
        }
        if (!settings.hasOwnProperty("remindme")) {
            settings.remindme = {};
        }
        if (!settings.hasOwnProperty("lists")) {
            settings.lists = {};
        }
        if (!settings.hasOwnProperty("moderation")) {
            settings.moderation = {
                "mute": [],
                "sanctions": {}
            };
        }
        fs.writeFileSync(`./FoxoBotData/${file}`, JSON.stringify(settings));
    });
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity("Foxes Playing", {
        type: "WATCHING"
    });
    console.log(`Logged into ${client.guilds.array().length} guilds`);
});


function readJSON(file) {
    return JSON.parse(fs.readFileSync(`./FoxoBotData/${file}.json`, `utf8`));
}

function saveJSON(file, data) {
    fs.writeFileSync(`./FoxoBotData/${file}.json`, JSON.stringify(data));
}


var getDefaultChannel = (guild, option = "") => {

    if (option !== "") {
        let settings = readJSON(guild.id);
        //get guild's chosen channel
        if (settings.welcome && option === "welcome") {
            let welcomeChannel = guild.channels.find(channel => channel.id === settings.welcome);
            if (welcomeChannel) {
                return welcomeChannel;
            }
        }
    }

    // get "original" default channel
    if (guild.channels.has(guild.id)) {
        return guild.channels.get(guild.id);
    }

    // Check for a "general" channel, which is often default chat
    let generalChannel = guild.channels.find(channel => channel.name === "general");
    if (generalChannel) {
        return generalChannel;
    }
    // Now we get into the heavy stuff: first channel in order where the bot can speak
    // hold on to your hats!
    return guild.channels
        .filter(c => c.type === "text" &&
            c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
        .sort((a, b) => a.position - b.position ||
            Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
        .first();
};


function getUserFromMention(mention) {
    if (!mention) { return };

    if (mention.startsWith("<@") && mention.endsWith(">")) {
        mention = mention.slice(2, -1);

        if (mention.startsWith("!")) {
            mention = mention.slice(1);
        }

        return client.users.get(mention);
    }
}


function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function play(connection, msg) {
    let server = servers[msg.guild.id];

    server.dispatcher = connection.playStream(YTDL(server.queue[0], {
        filter: "audioonly"
    }));

    if (server.notEnded && global.musicloop === 0) {
        YTDL.getInfo(server.queue[0], (err, info) => {
            if (err) throw err;
            var em = new Discord.RichEmbed().setColor(`ORANGE`)
                .addField("Now Playing", info.title)
                .addField("Uploaded By", info.author.name)
                .setThumbnail(info.author.avatar)
            msg.channel.send(em);
        });
    }

    server.dispatcher.on("end", function() {
        if (global.musicloop) {
            play(connection, msg);
        } else if (server.queue[1]) {
            server.queue.shift();
            play(connection, msg);
        } else {
            connection.disconnect();
        }
    });
}


function getPlaylist(url, msg) {
    let tmp = [];
    request.get(url, (err, res, body) => {
        if (err) {
            console.error(err);
            throw err;
        } else {
            let videoList = [];

            let handler = new htmlparser.DefaultHandler(function(err, dom) {
                if (err) {
                    console.error(err);
                    throw err;
                } else {
                    var list = select(dom, `.pl-video-title-link`);

                    list.forEach(function(node, i) {
                        var url = "https://www.youtube.com" +
                            node.attribs.href.replace(/&amp;/g, "&");

                        videoList.push({
                            url: url
                        });
                    });
                }
            });

            let parser = new htmlparser.Parser(handler);
            parser.parseComplete(body);
            let server = servers[msg.guild.id];

            videoList.forEach(function(item, index) {
                server.queue.push(item.url.split("&")[0]);
            });

            if (!msg.guild.voiceConnection) msg.member.voiceChannel.join().then(function(connection) {
                play(connection, msg)
            });
        }
    });
}


client.on("guildCreate", guild => {
    console.log("Joined a new guild: " + guild.name);
    let channel = getDefaultChannel(guild);
    var em = new Discord.RichEmbed().setColor(`ORANGE`)
        .setFooter("Version " + global.version)
        .setTitle("Introduction")
        .setDescription(`Thank you for adding me, my default prefix is \`${global.defaults.prefix}\` however you can always change it via the settings.`)
        .addField("Settings", `${global.defaults.prefix}settings`, true)
        .addField("Help", `${global.defaults.prefix}help`, true);
    channel.send(em);
    request({
        uri: "https://aikufurr.com/fluffster/api/image/fox",
        method: "GET",
        json: true,
        headers: {
            Token: secret.fluffsterwebtoken
        }
    }, function(error, response, body) {
        var em = new Discord.RichEmbed().setColor(`ORANGE`)
            .setImage(body)
        channel.send(em);
    });
});


client.on("guildDelete", guild => {
    console.log("Left a guild: " + guild.name);
});


client.on("guildMemberAdd", member => {
    let settings = readJSON(member.guild.id);
    if (settings.welcome) {
        let channel = getDefaultChannel(member.guild, "welcome");
        if (settings.welcomemsg) {
            channel.send(settings.welcomemsg.replace("{user}", member).replace("{guild}", guild.name));
        } else {
            channel.send(`Welcome ${member} to ${member.guild.name}!`);
        }
    }
});


async function checkTimes() {
    setInterval(() => {
        try {
            // RemindMe
            fs.readdir("./FoxoBotData/", function(err, files) {
                //handling error
                if (err) {
                    return console.log(`Unable to scan directory: ` + err);
                }
                files.forEach(function(file) {
                    let fjson = JSON.parse(fs.readFileSync(`./FoxoBotData/${file}`, `utf8`));
                    Object.keys(fjson.remindme).forEach(function(user) {
                        for (let i = 0; i < fjson.remindme[user].length; i++) {
                            let needed = new Date(fjson.remindme[user][i][0]);
                            let now = new Date();
                            if (needed < now) {
                                client.users.get(user).send(`<@${user}>, Here is your reminder: \`\`\`\n${fjson.remindme[user][i][1]}\n\`\`\``);
                                let index = fjson.remindme[user].indexOf(fjson.remindme[user][i]);
                                if (index > -1) {
                                    fjson.remindme[user].splice(index, 1);
                                }
                                fs.writeFileSync(`./FoxoBotData/${file}`, JSON.stringify(fjson));
                            }
                        }
                    });
                });
            });
        } catch (e) {
            console.error(e);
        }
        // Mutes
        try {
            fs.readdir("./FoxoBotData/", function(err, files) {
                //handling error
                if (err) {
                    return console.log(`Unable to scan directory: ` + err);
                }
                files.forEach(function(file) {
                    let fjson = JSON.parse(fs.readFileSync(`./FoxoBotData/${file}`, `utf8`));
                    for (let i = 0; i < fjson.moderation.mute.length; i++) {
                        let needed = new Date(fjson.moderation.mute[i][2]);
                        let now = new Date();
                        if (needed < now) {
                            fjson.moderation.mute.splice(i, 1);
                            fs.writeFileSync(`./FoxoBotData/${file}`, JSON.stringify(fjson));
                        }
                    }
                });
            });
        } catch (e) {
            console.error(e);
        }
    }, 5000);
}

checkTimes();


client.on("message", msg => {
    try {
        if (msg.author === client.user && msg.author !== 308681202548604938) {
            return;
        }
        if (fs.existsSync(`./FoxoBotData/${msg.guild.id}.json`)) {
            var settings = JSON.parse(fs.readFileSync(`./FoxoBotData/${msg.guild.id}.json`, `utf8`));
        } else {
            var settings = {
                "ranks": {},
                "toggled": [],
                "prefix": global.defaults.prefix,
                "welcome": 1,
                "remindme": {},
                "lists": {}
            };
            saveJSON(msg.guild.id, settings);
        }
        if (settings.ranks.hasOwnProperty(msg.author.id)) {
            settings.ranks[msg.author.id] += 1;
        } else {
            settings.ranks[msg.author.id] = 0;
        }
        if (!settings.hasOwnProperty("ranks")) {
            settings.ranks = {};
        }
        if (!settings.hasOwnProperty("toggled")) {
            settings.toggled = [];
        }
        if (!settings.hasOwnProperty("prefix")) {
            settings.prefix = global.defaults.prefix;
        }
        if (!settings.hasOwnProperty("welcome")) {
            settings.welcome = 1;
        }
        if (!settings.hasOwnProperty("remindme")) {
            settings.remindme = {};
        }
        if (!settings.hasOwnProperty("lists")) {
            settings.lists = {};
        }
        if (!settings.hasOwnProperty("moderation")) {
            settings.moderation = {
                "mute": [],
                "sanctions": {}
            };
        }

        saveJSON(msg.guild.id, settings);

        for (let i = 0; i < settings.moderation.mute.length; i++) {
            if (msg.author.id === settings.moderation.mute[i][0]) {
                msg.delete();
                return;
            }
        }

        if (!msg.content.startsWith(settings.prefix)) return;

        let args = msg.content.substring(settings.prefix.length).split(" ")

        if (settings.toggled.includes(args[0])) {
            return;
        }

        let perms = msg.member.permissions;
        let isAdmin = perms.has("ADMINISTRATOR");
        let server = servers[msg.guild.id];

        switch (args[0].toLowerCase()) {
            case "ping":
                msg.reply(`Pong!`);
                break;
            case "kick":
                if (!isAdmin) {
                    msg.reply("You are not an admin.")
                    break;
                }

                if (!args[1]) {
                    msg.reply(`${settings.prefix}kick [member] (optional reason)`)
                    break;
                }

                if (args[2]) {
                    let item = "";
                    for (let i = 2; i < args.length; i++) {
                        item += args[i] + " ";
                    }

                    item = item.substring(0, item.length - 1);
                    var reason = item;
                } else {
                    var reason = "None Given"
                }

                msg.reply(`Are you sure you want to kick ${getUserFromMention(args[1]).username} with the reason: \`${reason}\`? (y/n)`)
                var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
                    time: 10000,
                    maxMatches: 1
                });
                collector.on('collect', msgKick => {
                    if (msgKick.content === "y") {
                        getUserFromMention(args[1]).kick(reason);
                        msg.reply("Kicked")
                    }
                })
                break;
            case "ban":
                if (!isAdmin) {
                    msg.reply("You are not an admin.")
                    break;
                }
                if (!args[1]) {
                    msg.reply(`${settings.prefix}ban [member] (optional reason)`)
                    break;
                }

                if (args[2]) {
                    let item = "";
                    for (let i = 2; i < args.length; i++) {
                        item += args[i] + " ";
                    }

                    item = item.substring(0, item.length - 1);
                    var reason = item;
                } else {
                    var reason = "None Given"
                }

                msg.reply(`Are you sure you want to ban ${getUserFromMention(args[1]).username} with the reason: \`${reason}\`? (y/n)`)
                var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
                    time: 10000,
                    maxMatches: 1
                });
                collector.on('collect', msgBan => {
                    if (msgBan.content === "y") {
                        getUserFromMention(args[1]).ban({ reason: reason });
                        msg.reply("Banned")
                    }
                })
                break;
            case "sanction":
            case "sanctions":
                if (!isAdmin) {
                    msg.reply("You are not an admin.")
                    break;
                }

                let warns = "";
                let mutes = "";

                if (!args[1]) {
                    Object.keys(settings.moderation["sanctions"]).forEach(function(user) {
                        for (let i = 0; i < settings.moderation["sanctions"][user].length; i++) {
                            if (settings.moderation["sanctions"][user][i][0] === "warn") {
                                warns += `\n<@${user}>: \`${settings.moderation["sanctions"][user][i][1]}\` AT ${settings.moderation["sanctions"][user][i][2]}`
                            }
                            if (settings.moderation["sanctions"][user][i][0] === "mutes") {
                                mutes += `\n<@${user}>: \`${settings.moderation["sanctions"][user][i][1]}\` AT ${settings.moderation["sanctions"][user][i][2]}`
                            }
                        }
                    })
                } else {
                    let user = getUserFromMention(args[1]).id;
                    for (let i = 0; i < settings.moderation["sanctions"][user].length; i++) {
                        if (settings.moderation["sanctions"][user][i][0] === "warn") {
                            warns += `\n<@${user}>: \`${settings.moderation["sanctions"][user][i][1]}\` AT ${settings.moderation["sanctions"][user][i][2]}`
                        }
                        if (settings.moderation["sanctions"][user][i][0] === "mutes") {
                            mutes += `\n<@${user}>: \`${settings.moderation["sanctions"][user][i][1]}\` AT ${settings.moderation["sanctions"][user][i][2]}`
                        }
                    }
                }
                if (mutes === "") mutes = "None";
                if (warns === "") warns = "None";
                var em = new Discord.RichEmbed().setColor(`ORANGE`)
                    .setTitle(`Sanctions`)
                    .addField("Warns", warns, true)
                    .addField("Mutes", mutes, true)
                msg.channel.send(em);

                break;
            case "mute":
                if (!isAdmin) {
                    msg.reply("You are not an admin.")
                    break;
                }
                if (!args[1]) {
                    msg.reply(`${settings.prefix}mute [member] [time] (optional reason)`)
                } else if (args[1]) {
                    if (!settings.moderation.hasOwnProperty("mute")) {
                        settings.moderation["mute"] = {}
                    }
                    if (!settings.moderation["sanctions"].hasOwnProperty(getUserFromMention(args[1]).id)) {
                        settings.moderation["sanctions"][getUserFromMention(args[1]).id] = []
                    }

                    let now = new Date();

                    function addDate(date, t, delim) {
                        var delim = (delim) ? delim : `:`,
                            x = 0,
                            z = 0,
                            arr = t.split(delim);

                        for (let i = 0; i < arr.length; i++) {
                            z = parseInt(arr[i], 10);
                            if (z != NaN) {
                                let y = /^\d+?y/i.test(arr[i]) ? 31556926 : 0; //years
                                let w = /^\d+?w/i.test(arr[i]) ? 604800 : 0; //weeks
                                let d = /^\d+?d/i.test(arr[i]) ? 86400 : 0; //days
                                let h = /^\d+?h/i.test(arr[i]) ? 3600 : 0; //hours
                                let m = /^\d+?m/i.test(arr[i]) ? 60 : 0; //minutes
                                let s = /^\d+?s/i.test(arr[i]) ? 1 : 0; //seconds
                                x += z * (y + w + d + h + m + s);
                            }
                        }
                        date.setSeconds(date.getSeconds() + x);
                    }

                    if (/([0-9].*(y|w|d|h|m|s))/g.test(args[2])) {
                        addDate(now, args[2]);
                        if (args[3]) {
                            let item = "";
                            for (let i = 3; i < args.length; i++) {
                                item += args[i] + " ";
                            }

                            item = item.substring(0, item.length - 1);
                            var reason = item;
                        } else {
                            var reason = "None Given"
                        }
                    } else {
                        addDate(now, "1h");
                        if (args[2]) {
                            let item = "";
                            for (let i = 2; i < args.length; i++) {
                                item += args[i] + " ";
                            }

                            item = item.substring(0, item.length - 1);
                            var reason = item;
                        } else {
                            var reason = "None Given"
                        }
                    }

                    settings.moderation["mute"].push(["mute", getUserFromMention(args[1]).id, reason, now.toString()]);
                    settings.moderation["sanctions"][getUserFromMention(args[1]).id].push(["mute", getUserFromMention(args[1]).id, reason, now.toString()]);
                    saveJSON(msg.guild.id, settings);
                    msg.delete();
                    var em = new Discord.RichEmbed().setColor(`ORANGE`)
                        .setTitle(`Muted: \`${getUserFromMention(args[1]).username}\``)
                        .setDescription(`Reason: \`${reason}\``)
                    msg.channel.send(em);
                }
                break;
            case "warn":
                if (!isAdmin) {
                    msg.reply("You are not an admin.")
                    break;
                }
                if (!args[1]) {
                    msg.reply(`${settings.prefix}warn [member] (optional reason)`)
                } else if (args[1]) {
                    if (!settings.moderation["sanctions"].hasOwnProperty(getUserFromMention(args[1]).id)) {
                        settings.moderation["sanctions"][getUserFromMention(args[1]).id] = []
                    }
                    if (args[2]) {
                        let item = "";
                        for (let i = 2; i < args.length; i++) {
                            item += args[i] + " ";
                        }

                        item = item.substring(0, item.length - 1);
                        var reason = item;
                    } else {
                        var reason = "None Given"
                    }
                    let now = new Date();

                    settings.moderation["sanctions"][getUserFromMention(args[1]).id].push(["warn", reason, now.toString()]);
                    saveJSON(msg.guild.id, settings);
                    msg.delete();
                    var em = new Discord.RichEmbed().setColor(`ORANGE`)
                        .setTitle(`Warned: \`${getUserFromMention(args[1]).username}\``)
                        .setDescription(`Reason: \`${reason}\``)
                    msg.channel.send(em);
                }
                break;
            case "lists":
            case "list":
                if (!settings.lists.hasOwnProperty(msg.author.id)) {
                    settings.lists[msg.author.id] = {}
                }

                if (Object.keys(settings.lists[msg.author.id]).length > 0) {
                    let lists = ""
                    let loop = 0;
                    let userLists = {}
                    Object.keys(settings.lists[msg.author.id]).forEach((list) => {
                        lists += `\n${loop}: ${list}`
                        userLists[loop] = list
                        loop += 1
                    })
                    var em = new Discord.RichEmbed().setColor(`ORANGE`)
                        .setTitle(`Lists`)
                        .setDescription(`**DEV** Type the number of the list to select it or say one of the commands:\n\`new\` to create a new list\n\`cancel\` to stop\n${lists}`)
                    msg.channel.send(em);
                    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
                        time: 10000,
                        maxMatches: 1
                    });
                    collector.on('collect', msgList => {
                        msgList.content = msgList.content.toLowerCase();
                        if (msgList.content.includes("cancel")) {
                            msgList.channel.send("Cancelling");
                            return;
                        }
                        if (!/([0-9]+)|(new)+/g.test(msgList.content)) {
                            msg.reply("Please enter a valid command/number");
                            msg.channel.send("Cancelling");
                            return;
                        }
                        if (["new"].includes(msgList.content)) {
                            msg.reply("Enter the list name")
                            var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
                                time: 10000,
                                maxMatches: 1
                            });
                            collector.on('collect', msgNewList => {
                                settings.lists[msg.author.id][msgNewList.content] = []
                                saveJSON(msg.guild.id, settings);
                                msg.reply("Created")
                                return;
                            })
                            return;
                        }
                        let selectedList = settings.lists[msg.author.id][userLists[msgList.content]];
                        if (Object.keys(selectedList).length === 0) {
                            var lists = "None";
                        } else {
                            var lists = ""
                            for (let i = 0; i < selectedList.length; i++) {
                                lists += `\n${i}: ${selectedList[i]}`
                            }
                        }
                        var em = new Discord.RichEmbed().setColor(`ORANGE`)
                            .setTitle(`List: ${userLists[msgList.content]}`)
                            .setDescription(`**DEV** Type the number of the item to select it or say one of the commands:\n\`new\` to create a new item\n\`edit\` to edit the name of this list \n\`delete\` to delete this list \n\`cancel\` to stop`)
                            .addField(`Items in ${userLists[msgList.content]}`, `${lists}`, true)
                        msg.channel.send(em);
                        var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
                            time: 10000,
                            maxMatches: 1
                        });
                        collector.on('collect', msgItem => {
                            msgItem.content = msgItem.content.toLowerCase();
                            if (msgItem.content.includes("cancel")) {
                                msg.channel.send("Cancelling");
                                return;
                            }
                            if (!/([0-9]+)|(edit)|(delete)|(new)+/g.test(msgItem.content)) {
                                msg.reply("Please enter a valid command/number");
                                msg.channel.send("Cancelling");
                                return;
                            }
                            if (["edit", "delete", "new"].includes(msgItem.content)) {
                                if (msgItem.content === "edit") {
                                    msg.reply("Enter the new name")
                                    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
                                        time: 10000,
                                        maxMatches: 1
                                    });
                                    collector.on('collect', msgEdit => {
                                        let old_key = userLists[msgList.content];
                                        let new_key = msgEdit.content;
                                        if (old_key !== new_key) {
                                            Object.defineProperty(settings.lists[msg.author.id], new_key,
                                                Object.getOwnPropertyDescriptor(settings.lists[msg.author.id], old_key));
                                            delete settings.lists[msg.author.id][old_key];
                                        }
                                        saveJSON(msg.guild.id, settings);
                                        msg.reply("Saved")
                                    })
                                }
                                if (msgItem.content === "new") {
                                    msg.reply("Enter the new item")
                                    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
                                        time: 10000,
                                        maxMatches: 1
                                    });
                                    collector.on('collect', msgNew => {
                                        settings.lists[msg.author.id][userLists[msgList.content]].push(msgNew.content)
                                        saveJSON(msg.guild.id, settings);
                                        msg.reply("Created")
                                    })
                                }
                                if (msgItem.content === "delete") {
                                    msg.reply(`Are you sure you want to delete ${userLists[msgList.content]}? (y/n)`)
                                    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
                                        time: 10000,
                                        maxMatches: 1
                                    });
                                    collector.on('collect', msgDelete => {
                                        if (msgDelete.content === "y") {
                                            settings.lists[msg.author.id][userLists[msgList.content]].pop(msgItem.content)
                                            saveJSON(msg.guild.id, settings);
                                            msg.reply("Deleted");
                                            return;
                                        } else {
                                            msg.channel.send("Cancelling");
                                            return;
                                        }
                                    })
                                }
                                return;
                            }
                            let selectedList = settings.lists[msg.author.id][userLists[msgList.content]][msgItem.content];

                            var em = new Discord.RichEmbed().setColor(`ORANGE`)
                                .setTitle(`${selectedList}`)
                                .setDescription(`Commands: \`edit\`, \`delete\`, \`cancel\``)
                            msg.channel.send(em);
                            var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
                                time: 10000,
                                maxMatches: 1
                            });
                            collector.on('collect', msgItemSub => {
                                msgItemSub.content = msgItemSub.content.toLowerCase();
                                if (msgItemSub.content.includes("cancel")) {
                                    msg.channel.send("Cancelling");
                                    return;
                                }
                                if (!["edit", "delete"].includes(msgItemSub.content)) {
                                    msg.reply("Please enter a valid option");
                                    msg.channel.send("Cancelling");
                                    return;
                                }
                                if (msgItemSub.content === "edit") {
                                    msg.reply("Enter the new item")
                                    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
                                        time: 10000,
                                        maxMatches: 1
                                    });
                                    collector.on('collect', msgEdit => {
                                        settings.lists[msg.author.id][userLists[msgList.content]][msgItem.content] = msgEdit.content
                                        saveJSON(msg.guild.id, settings);
                                        msg.reply("Saved")
                                    })
                                } else if (/(edit [0-9]+)/g.test(msgItemSub.content)) {
                                    settings.lists[msg.author.id][userLists[msgList.content]][msgItem.content] = msgItemSub.content.substring(5)
                                    saveJSON(msg.guild.id, settings);
                                    msg.reply("Saved")
                                } else if (msgItemSub.content === "delete") {
                                    msg.reply(`Are you sure you want to delete? (y/n)`)
                                    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
                                        time: 10000,
                                        maxMatches: 1
                                    });
                                    collector.on('collect', msgDelete => {
                                        if (msgDelete.content === "y") {
                                            settings.lists[msg.author.id][userLists[msgList.content]].pop(msgItem.content)
                                            saveJSON(msg.guild.id, settings);
                                            msg.reply("Deleted");
                                            return;
                                        } else {
                                            msg.channel.send("Cancelling");
                                            return;
                                        }
                                    })
                                }
                            })
                        })
                    })
                } else {
                    msg.reply("You currently don't have any lists, would you like to create one? (y/n)")
                    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
                        time: 10000,
                        maxMatches: 1
                    });
                    collector.on('collect', msgMakeNewList => {
                        if (msgMakeNewList.content === "y") {
                            msg.reply("Enter the list name")
                            var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
                                time: 10000,
                                maxMatches: 1
                            });
                            collector.on('collect', msgNewList => {
                                settings.lists[msg.author.id][msgNewList.content] = []
                                saveJSON(msg.guild.id, settings);
                                msg.reply("Created")
                                return;
                            })
                        }
                    })
                }
                break;
            case "flipacoin":
            case "flipcoin":
            case "flip-a-coin":
            case "flip":
            case "coin":
                msg.reply(`It's ${["Heads", "Tails"][Math.floor(Math.random()*2)]}!`);
                break;
            case "invite":
                msg.reply("My Invite Link: https://discordapp.com/api/oauth2/authorize?client_id=618802156283363328&permissions=8&scope=bot");
                break;
            case "help":
                if (!args[1]) {
                    var em = new Discord.RichEmbed().setColor(`ORANGE`)
                        .setFooter("Version " + global.version)
                        .setTitle("Help")
                        .setDescription(`To get more infomation on a command type \`${settings.prefix}help <option>\` example: \`${settings.prefix}help Music\``)
                        .addField("Settings", `${settings.prefix}settings`, true)
                        .addField("Images", `For a list of image commands type \`${settings.prefix}help images\``, true)
                        .addField("Music", `${settings.prefix}play <YT url or playlist>\n${settings.prefix}pause\n${settings.prefix}resume\n${settings.prefix}skip\n${settings.prefix}shuffle\n${settings.prefix}volume <0 to 1>\n${settings.prefix}queue\n${settings.prefix}ytinfo <YT url>`, true)
                        .addField("Fun", `${settings.prefix}avatar\n${settings.prefix}rank\n${settings.prefix}remindme`, true)
                        .addField("Moderation", `${settings.prefix}mute [member] (optional reason)\n${settings.prefix}rank\n${settings.prefix}remindme`, true);
                    msg.channel.send(em);
                } else {
                    switch (args[1].toLowerCase()) {
                        case "image":
                        case "images":
                            request({
                                uri: "https://aikufurr.com/fluffster/api/endpoints",
                                method: "GET",
                                json: true
                            }, (error, response, body) => {
                                let imageout = "";
                                for (let i = 0; i < body.length; i++) {
                                    imageout += `${settings.prefix}${body[i].split(/[\/]+/).pop()}\n`;
                                }
                                var em = new Discord.RichEmbed().setColor(`ORANGE`)
                                    .setTitle("Images")
                                    .setDescription(`All commands that start with \`y\` are NSFW and can only be send in a NSFW channel.\n${imageout}`)
                                msg.channel.send(em);
                            });
                            break;
                        case "settings":
                            var em = new Discord.RichEmbed().setColor(`ORANGE`)
                                .setTitle("Settings")
                                .setDescription("To get to the setting, type `" + settings.prefix + "settings`")
                            msg.channel.send(em);
                            break;
                        case "music":
                            let collector = new Discord.RichEmbed().setColor(`ORANGE`)
                                .setTitle("Music")
                                .addField("play", `usage: \`${settings.prefix}play URL/PLAYLIST\`\nexample: \`${settings.prefix}play https://www.youtube.com/watch?v=1UF-uVi0GlU\`\nexample: \`${settings.prefix}play https://www.youtube.com/playlist?list=OLAK5uy_nPfI0OOarBfgx1bsnIn21KQ2NMi2Z76MQ\`\nPlayes media from youtube`)
                                .addField("pause", `usage: \`${settings.prefix}pause\`\nPauses the currently playing song`)
                                .addField("resume", `usage: \`${settings.prefix}resume\`\nResumes the currently playing song`)
                                .addField("skip", `usage: \`${settings.prefix}skip\`\nSkips the currently playing song`)
                                .addField("shuffle", `usage: \`${settings.prefix}shuffle\`\nShuffles the current song queue`)
                                .addField("volume", `usage: \`${settings.prefix}volume 0-1\`\nexample: \`${settings.prefix}volume 0.6\`\nSets the volume of the currently playing song`)
                                .addField("queue", `usage: \`${settings.prefix}queue\`\nShows the current video queue`)
                                .addField("ytinfo", `usage: \`${settings.prefix}ytinfo URL\`\nexample: \`${settings.prefix}ytinfo https://www.youtube.com/watch?v=1UF-uVi0GlU\`\nDisplays super basic information from a video`)
                            msg.channel.send(em);
                            break;

                    }
                }
                break;
            case "settings":
            case "setting":
                if (!args[1]) {
                    var em = new Discord.RichEmbed().setColor(`ORANGE`)
                        .setTitle("Settings")
                        .setDescription("To get more infomation on a command type `" + settings.prefix + "settings <option>`")
                        .addField("Prefix", "`" + settings.prefix + "settings prefix <newprefix>`")
                        .addField("Commands", "`" + settings.prefix + "settings commands`")
                        .addField("Welcome", `usage: \`${settings.prefix}settings welcome\` Toggles welcome message\n\`${settings.prefix}settings welcome MSG\` Sets a custom welcome message, use \`{user}\` in the message to mention the new user, use \`{guild}\` in the message to show the server name. Example: \`${settings.prefix}settings welcome Welcome {user} to {guild}!\``)
                    msg.channel.send(em);
                }
                if (args)
                    if (args[1] === "welcome") {
                        let perms = msg.member.permissions;
                        let isAdmin = perms.has("ADMINISTRATOR");
                        if (!isAdmin) {
                            msg.reply("You are not an admin.")
                            break;
                        }
                        if (!args[2]) {
                            if (!settings) {
                                settings = {}
                            }
                            if (settings.welcome) {
                                settings.welcome = 0;
                                msg.channel.send("Welcome message is now off");
                                break;
                            }
                            if (!settings.welcome) {
                                settings.welcome = 1;
                                msg.channel.send("Welcome message is now on");
                                break;
                            }
                            break;
                        }

                        let item = "";
                        for (let i = 2; i < args.length; i++) {
                            item += args[i] + " ";
                        }

                        item = item.substring(0, item.length - 1);
                        settings.welcomemsg = item;

                        msg.channel.send("Welcome message is now set to `" + item + "`")
                        saveJSON(msg.guild.id, settings);
                        break;
                    }

                if (args[1] === "prefix") {
                    let perms = msg.member.permissions;
                    let isAdmin = perms.has("ADMINISTRATOR");
                    if (!isAdmin) {
                        msg.reply("You are not an admin.")
                        break;
                    }
                    if (!args[2]) {
                        var em = new Discord.RichEmbed().setColor(`ORANGE`)
                            .setTitle("Settings")
                            .setDescription("Sets the prefix for the server, usefull for servers with multiple bots.")
                            .addField("prefix", "`" + settings.prefix + "settings prefix <newprefix>`")
                            .addField("Example", "`" + settings.prefix + "settings prefix !`")
                        msg.channel.send(em);
                        break;
                    }
                    settings.prefix = args[2];

                    msg.channel.send("Pefix is now set to `" + args[2] + "`")
                    saveJSON(msg.guild.id, settings);
                } else if (args[1] === "toggle") {
                    let perms = msg.member.permissions;
                    let isAdmin = perms.has("ADMINISTRATOR");
                    if (!isAdmin) {
                        msg.reply("You are not an admin.")
                        break;
                    }
                    if (!args[2]) {
                        var em = new Discord.RichEmbed().setColor(`ORANGE`)
                            .setTitle("Settings")
                            .setDescription("How to use toggle.")
                            .addField("Toggle", "`" + settings.prefix + "settings toggle <command>`")
                            .addField("Example", "`" + settings.prefix + "settings toggle `", true)
                        msg.channel.send(em);
                        break;
                    }
                    if (settings.toggled.includes(args[2])) {
                        let index = settings.toggled.indexOf(args[2]);
                        if (index > -1) {
                            settings.toggled.splice(index, 1);
                        }
                        msg.channel.send("Removed " + args[2] + " from blacklist")
                    } else {
                        console.log(args[2]);
                        settings.toggled.push(args[2]);
                        console.log(settings.toggled);
                        msg.channel.send("Added " + args[2] + " to blacklist")
                    }

                    saveJSON(msg.guild.id, settings);
                }
                break;
            case "eval":
                if (msg.author.id == 308681202548604938) {
                    try {
                        eval(msg.content.substring(settings.prefix.length + 5));
                        msg.channel.send("Success");
                    } catch (err) {
                        msg.channel.send("Error: " + err);
                    }
                } else {
                    msg.reply("You are not authorized to use this command.");
                }
                break;
            case "remindme":
                if (!settings.remindme.hasOwnProperty(msg.author.id)) {
                    settings.remindme[msg.author.id] = []
                }
                if (!args[1]) {
                    if (settings.remindme[msg.author.id].length == 0) {
                        msg.reply(`Looks like you don't have any RemindMes, type \`${settings.prefix}remindme 10m item\`, item being what you to be reminded about, examples: \nRemind 1 day later: \`${settings.prefix}remindme 1d Do this thing\`\nRemind 15 minutes later: \`${settings.prefix}remindme 15m Do this thing\`\nAccepted formats: \`ny:nw:nd:nh:nm:ns\` where \`n\` is a number`)
                    } else {
                        let out = "";
                        for (let i = 0; i < settings.remindme[msg.author.id].length; i++) {
                            out += `${i+1}: ${settings.remindme[msg.author.id][i]}\n`
                        }
                        msg.reply(`Your RemindMes: \`\`\`\n${out}\`\`\``)
                    }
                } else {
                    let now = new Date();
                    let item = "";
                    for (let i = 2; i < args.length; i++) {
                        item += args[i] + " ";
                    }

                    item = item.substring(0, item.length - 1);



                    function addDate(date, t, delim) {
                        var delim = (delim) ? delim : `:`,
                            x = 0,
                            z = 0,
                            arr = t.split(delim);

                        for (let i = 0; i < arr.length; i++) {
                            z = parseInt(arr[i], 10);
                            if (z != NaN) {
                                let y = /^\d+?y/i.test(arr[i]) ? 31556926 : 0; //years
                                let w = /^\d+?w/i.test(arr[i]) ? 604800 : 0; //weeks
                                let d = /^\d+?d/i.test(arr[i]) ? 86400 : 0; //days
                                let h = /^\d+?h/i.test(arr[i]) ? 3600 : 0; //hours
                                let m = /^\d+?m/i.test(arr[i]) ? 60 : 0; //minutes
                                let s = /^\d+?s/i.test(arr[i]) ? 1 : 0; //seconds
                                x += z * (y + w + d + h + m + s);
                            }
                        }
                        date.setSeconds(date.getSeconds() + x);
                    }

                    addDate(now, args[1]);
                    settings.remindme[msg.author.id].push([now.toString(), item]);
                    msg.reply(`Added \`${ item }\` to your RemindMes and will remind you at \`${now.toString()}\``);
                }
                break;
            case "play":
                if (!args[1]) {
                    msg.channel.send("URL not provided.")
                    break;
                };

                if (!msg.member.voiceChannel) {
                    msg.channel.send("You must be in a voice channel to use this command")
                    break;
                };

                if (!servers[msg.guild.id]) servers[msg.guild.id] = {
                    queue: []
                };


                server.notEnded = true;

                if (args[1].includes("list=")) {
                    let playlistURL = "https://www.youtube.com/playlist?list=" + args[1].split("list=")[1];
                    getPlaylist(playlistURL, msg);
                } else {
                    server.queue.push(args[1]);
                    YTDL.getInfo(args[1], (err, info) => {
                        if (err) throw err;
                        msg.channel.send("Added `" + info.title + "` videos to the queue");
                    });

                    if (!msg.guild.voiceConnection) msg.member.voiceChannel.join().then(function(connection) {
                        play(connection, msg)
                    });
                }
                break;
            case "queue":

                var em = new Discord.RichEmbed().setColor(`ORANGE`);
                let out = "";
                em.setTitle("Music Queue");
                em.setDescription(server.queue);
                msg.channel.send(em);
                break;
            case "skip":


                if (!msg.member.voiceChannel) {
                    msg.channel.send("You must be in a voice channel to use this command")
                    break;
                };

                if (server.dispatcher) server.dispatcher.end();
                break;
            case "stop":


                server.notEnded = false;

                if (!msg.member.voiceChannel) {
                    msg.channel.send("You must be in a voice channel to use this command")
                    break;
                };

                if (msg.guild.voiceConnection) msg.guild.voiceConnection.disconnect();

                server.queue = []
                break;
            case "shuffle":
                if (!msg.member.voiceChannel) {
                    msg.channel.send("You must be in a voice channel to use this command")
                    break;
                };



                if (!server.dispatcher) {
                    msg.channel.send("Nothing is playing")
                }

                server.queue = shuffle(server.queue);

                msg.channel.send("Shuffled")

                break;
            case "volume":


                if (!msg.member.voiceChannel) {
                    msg.channel.send("You must be in a voice channel to use this command")
                    break;
                };

                let volume = args[1] * 0.1;

                if (server.dispatcher) server.dispatcher.setVolume(volume);
                break;
            case "loop":


                if (!msg.member.voiceChannel) {
                    msg.channel.send("You must be in a voice channel to use this command")
                    break;
                };

                if (global.musicloop) {
                    global.musicloop = 0;
                    msg.channel.send("Loop disabled");
                } else {
                    global.musicloop = 1;
                    msg.channel.send("Loop enabled");
                }

                break;
            case "pause":


                if (!msg.member.voiceChannel) {
                    msg.channel.send("You must be in a voice channel to use this command")
                    break;
                };

                if (server.dispatcher) {
                    server.dispatcher.pause();
                } else {
                    msg.channel.send("Nothing is playing")
                }

                break;
            case "resume":


                if (!msg.member.voiceChannel) {
                    msg.channel.send("You must be in a voice channel to use this command")
                    break;
                };

                if (server.dispatcher) {
                    server.dispatcher.resume();
                } else {
                    msg.channel.send("Nothing is playing")
                }

                break;
            case "ytinfo":
                if (!args[1]) {
                    msg.channel.send("URL not provided.")
                    break;
                };

                YTDL.getInfo(args[1], (err, info) => {
                    if (err) throw err;
                    var em = new Discord.RichEmbed().setColor(`ORANGE`)
                        .addField("Title", info.title, true)
                        .addField("Uploaded By", info.author.name, true)
                        .setThumbnail(info.author.avatar)
                    msg.channel.send(em);
                });
                break;
            case "rank":
                if (args[1]) {
                    var user = getUserFromMention(args[1]);
                    if (!user) {
                        msg.reply(`Please use a proper mention if you want to see someone else\'s rank.`);
                        break;
                    }
                } else {
                    var user = msg.author
                }

                if (settings.ranks.hasOwnProperty(user.id)) {

                    let arr = Object.entries(settings.ranks).sort(([key1, val1], [key2, val2]) => val2 - val1)

                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i][0] == user.id) {
                            var player_rank = i + 1;
                            break;
                        }
                    }

                    let player_total_xp = settings.ranks[user.id];

                    let total_players = client.guilds.get(msg.guild.id).memberCount;

                    var em = new Discord.RichEmbed().setColor(`ORANGE`)
                        .setTitle(user.username + "'s Rank")
                        .addField("Rank", player_rank + "/" + total_players, true)
                        .addField("Messages", player_total_xp, true)
                    msg.channel.send(em);
                }
                break;
            case "avatar":
                if (args[1]) {
                    let user = getUserFromMention(args[1]);
                    if (!user) {
                        msg.reply(`Please use a proper mention if you want to see someone else\'s avatar.`);
                        break;
                    }

                    msg.channel.send(`${user.username}'s avatar: ${user.displayAvatarURL}`);
                    break;
                }

                msg.channel.send(`${msg.author.username}, your avatar: ${msg.author.displayAvatarURL}`);
                break;
            default:
                try {
                    if (args[0].startsWith(`y`) && !msg.channel.nsfw) {
                        break;
                    }
                    if (args[1]) {
                        try {
                            var spam = parseInt(args[1]);
                            if (spam > 20) {
                                msg.reply("The limit is 20 per command")
                                break;
                            }
                        } catch (e) {
                            console.error(e);
                            var spam = 1;
                        }
                        if (args[1].startsWith("<")) {
                            var spam = 1
                        };
                    } else {
                        var spam = 1;
                    }
                    for (let i = 0; i < spam; i++) {
                        request({
                            uri: "https://aikufurr.com/api/images/" + args[0],
                            method: "GET",
                            json: true
                        }, (error, response, body) => {
                            var em = new Discord.RichEmbed().setColor(`ORANGE`)
                                .setImage(body)
                            msg.channel.send(em);
                        });
                    }
                } catch (e) {
                    console.error(e);
                }
                break;
        };
        saveJSON(msg.guild.id, settings);
    } catch (e) {
        console.error(e);
    }
});

client.login(secret.foxobot);