const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const ytdl = require("ytdl-core");
const discordTTS = require("discord-tts");

const client = new Discord.Client();

const queue = new Map();

client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue);
    return;
  } else {
    message.channel.send("You need to enter a valid command!");
  }
});

async function execute(message, serverQueue) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  // const songInfo = await ytdl.getInfo(args[1]);
  // const song = {
  //   title: songInfo.videoDetails.title,
  //   url: songInfo.videoDetails.video_url,
  // };

  // if (!serverQueue) {
  //   const queueContruct = {
  //     textChannel: message.channel,
  //     voiceChannel: voiceChannel,
  //     connection: null,
  //     songs: [],
  //     volume: 5,
  //     playing: true,
  //   };

  //   queue.set(message.guild.id, queueContruct);

  //   queueContruct.songs.push(song);

  try {
    var connection = await voiceChannel.join();

    // play(message.guild);
    play(message);
  } catch (err) {
    console.log(err);
    queue.delete(message.guild.id);
    return message.channel.send(err);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function play(message) {

 const generalVoice = client.channels.cache.get("779528239857008641");

var randomPerson= getRandomInt(0, generalVoice.members.size)
console.log(randomPerson)
  const myArray = [...generalVoice.members];
  console.log(myArray) 
  console.log(myArray[randomPerson][0]) 
  const idRandomPerson= myArray[randomPerson][0]




 message.guild.voiceStates.cache.forEach(member => (member.id === idRandomPerson)? member.setDeaf(true): member.setDeaf(false))

  //message.guild.voiceStates.cache.forEach(member =>console.log(member))

  const broadcast = client.voice.createBroadcast();
  var channelId = "779528239857008641";
  var channel = client.channels.cache.get(channelId);
  channel.join().then((connection) => {
    broadcast.play(
      discordTTS.getVoiceStream(
        // "Welcome to Heads Up. One player will be selected to guess the others actions. If you are right, say correct, if wrong, say pass."
        "hi"
      )
    );
    const dispatcher = connection.play(broadcast);
  });
}

client.login(token);

// const Discord = require("discord.js");
// const config = require("./config.json");

// const client = new Discord.Client();
// console.log("started")
// const prefix = "!";

// client.on("message", function(message) {
//   if (message.author.bot) return;
//   if (!message.content.startsWith(prefix)) return;

//   const commandBody = message.content.slice(prefix.length);
//   const args = commandBody.split(' ');
//   const command = args.shift().toLowerCase();

//   if (command == "s"){
//     const generalVoice = client.channels.cache.get('779513626758217745');

//     const activityChannels = ['779528239857008641', '779528312728584192']

//     let i = 0;
//     for (const [memberID, member] of generalVoice.members) {
//         member.voice.setChannel(activityChannels[i % 2]);
//         i++;
//     }
//   }

//   else if (command === "ping") {
//     const timeTaken = Date.now() - message.createdTimestamp;
//     message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
//   }

//   else if (command === "sum") {
//     const numArgs = args.map(x => parseFloat(x));
//     const sum = numArgs.reduce((counter, x) => counter += x);
//     message.reply(`The sum of all the arguments you provided is ${sum}!`);
//   }

// });

// client.login(config.BOT_TOKEN);

// dev
// 779528162316255244

// general
// 779513626758217745

// room one
// 779528239857008641

// room two
// 779528312728584192
/***
 * 
 * const Endb = require('endb');
Then you can create an SQLite database:
const endb = new Endb('sqlite://DATABASE_FILE_NAME.sqlite');
Make sure to replace DATABASE_FILE_NAME with the name you want to give to your database.

Then anywhere in your code, you can use methods such as
endb.set("KEY", "VALUE") (for setting a new element to the database with a key and a value)
endb.get("KEY") (for getting the value of an element based on the key)
endb.delete("KEY") (delete an element based on the key)
endb.all() (get all the elements of your database)
VALUE can be of almost any data type, including objects and arrays.

 */
