const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const ytdl = require("ytdl-core");
var fs = require('fs')

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

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    const selectedUser = '224294800642408451'
    const connection = await message.member.voice.channel.join();
    speaking_user(connection, selectedUser)


    // var newFile = pcm_to_wav(fileName);
    // var results = await speech_to_text(newFile);

    // console.log(results)

    // var wavConverter = require('wav-converter')
    // var fs = require('fs')
    // var path = require('path')
    // var pcmData = fs.readFileSync(path.resolve(__dirname, './temp/' + fileName))
    // var wavData = wavConverter.encodeWav(pcmData, {
    //     numChannels: 2,
    //     sampleRate: 48000,
    //     byteRate: 16
    // })
    
    // fs.writeFileSync(path.resolve(__dirname, './coool.wav'), wavData)






    // return;
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

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
   };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue!`);
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

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    // .play(ytdl(song.url))
    .play("./test.mp3")
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

client.login(token);


async function speaking_user(connection, selectedUser){
  connection.on('speaking', async (user, speaking) => {
    if (user == selectedUser){
      console.log("Listening to user")

      const fileName = './temp/' + Date.now() + '.pcm';

        // this creates a 16-bit signed PCM, stereo 48KHz stream
        const audioStream = connection.receiver.createStream(user, { mode: 'pcm' })
        const outputStream = fs.createWriteStream(fileName);
        audioStream.pipe(outputStream)

        audioStream.on('end', async () => {
          const stats = fs.statSync(fileName);
          const fileSizeInBytes = stats.size;
          const duration = fileSizeInBytes / 48000 / 4;
          console.log("duration: " + duration)

          if (duration < 0.5 || duration > 19) {
              console.log("TOO SHORT / TOO LONG; SKPPING")
              return;
          }else{
            var newFile = pcm_to_wav(fileName);
            console.log('new file')
            console.log(newFile)
            var results = await speech_to_text(newFile);
            console.log(results)
            // return fileName
          }
        });
    }
  });
}


function pcm_to_wav(fileName){
  var wavConverter = require('wav-converter')
  var path = require('path')

  var pcmData = fs.readFileSync(fileName)
  var wavData = wavConverter.encodeWav(pcmData, {
    numChannels: 2,
    sampleRate: 48000,
    byteRate: 16
  })
  
  var newFileName = './temp/' + Date.now() + '.wav'

  // fs.writeFileSync(fileName + '.wav', wavData)
  fs.writeFileSync(path.resolve(__dirname, newFileName), wavData)

  return newFileName
}

async function speech_to_text(fileName){
  const fetch = require('node-fetch');
  const response = await fetch('http://127.0.0.1:5000/convert/' + fileName.substring(2));
  return await response.json();
}






// client.login(token);



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