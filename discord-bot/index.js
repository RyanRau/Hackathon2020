const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();
console.log("started")
const prefix = "!";

client.on("message", function(message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(' ');
  const command = args.shift().toLowerCase();

  if (command == "s"){
    const generalVoice = client.channels.cache.get('779513626758217745');

    const activityChannels = ['779528239857008641', '779528312728584192']

    let i = 0;
    for (const [memberID, member] of generalVoice.members) {
        member.voice.setChannel(activityChannels[i % 2]);
        i++;
    }
  }

  else if (command === "ping") {
    const timeTaken = Date.now() - message.createdTimestamp;
    message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
  }

  else if (command === "sum") {
    const numArgs = args.map(x => parseFloat(x));
    const sum = numArgs.reduce((counter, x) => counter += x);
    message.reply(`The sum of all the arguments you provided is ${sum}!`);
  }

});

client.login(config.BOT_TOKEN);

// dev
// 779528162316255244

// general
// 779513626758217745

// room one
// 779528239857008641

// room two
// 779528312728584192