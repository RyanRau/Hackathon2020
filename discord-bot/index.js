// dev
// 779528162316255244
// general
// 779513626758217745
// room one
// 779528239857008641
// room two
// 779528312728584192
const { prefix, token } = require("./config.json");

const Discord = require("discord.js");
const wavConverter = require('wav-converter')
const path = require('path')
const fs = require('fs')
const discordTTS = require("discord-tts");
const { connect } = require("http2");

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

  if (message.content.startsWith(`${prefix}listen`)) {
    var selectedUser = '224294800642408451' //only listens to me (Ryan)
    var connection = await message.member.voice.channel.join();
    transcription_of_user(connection, selectedUser, message, '')


  } else if (message.content.startsWith(`${prefix}channel`)) {
    message.channel.send("responding to channel")

  } else if (message.content.startsWith(`${prefix}dm`)) {
    message.author.send("sent to dm")

  } else if (message.content.startsWith(`${prefix}play`)){
    start_game(message)

  } else {
    message.channel.send("You need to enter a valid command!");
  }
});


// Speech to text stuff... requires python server to be running 
async function transcription_of_user(connection, broadcast, selectedUser, message, key_words){
  connection.on('speaking', async (user, speaking) => {
    if (user == selectedUser){
      console.log("Listening to user")

      const fileName = './temp/' + Date.now() + '.pcm';

      const audioStream = connection.receiver.createStream(user, { mode: 'pcm' })
      const outputStream = fs.createWriteStream(fileName);
      audioStream.pipe(outputStream)

      await audioStream.on('end', async () => {
        const stats = fs.statSync(fileName);
        const fileSizeInBytes = stats.size;
        const duration = fileSizeInBytes / 48000 / 4;
        console.log("duration: " + duration)

        if (duration < 0.5 || duration > 19) {
            console.log("TOO SHORT / TOO LONG; SKPPING")
            return;
        }else{
          var newFile = pcm_to_wav(fileName);
          var results = await speech_to_text(newFile);

          console.log(results)
          var answer = results.text

          if (answer != null && answer.includes("cat")){
            // connect.removeListener()
            // bot.removeListener('messageCreate', listener);
            broadcast_msg(broadcast, connection, "correct")
          }
          else if (answer != null){
            broadcast_msg(broadcast, connection, answer)
          }
        }
      });
    }
  });
}

function pcm_to_wav(fileName){
  var pcmData = fs.readFileSync(fileName)
  var wavData = wavConverter.encodeWav(pcmData, {
    numChannels: 2,
    sampleRate: 48000,
    byteRate: 16
  })
  
  var newFileName = './temp/' + Date.now() + '.wav'
  fs.writeFileSync(path.resolve(__dirname, newFileName), wavData)

  return newFileName
}

async function speech_to_text(fileName){
  const fetch = require('node-fetch');
  const response = await fetch('http://127.0.0.1:5000/convert/' + fileName.substring(2));
  return await response.json();
}

function splitUsers(){
  const generalVoice = client.channels.cache.get('779513626758217745');

  const activityChannels = ['779528239857008641', '779528312728584192']

  let i = 0;
  for (const [memberID, member] of generalVoice.members) {
    member.voice.setChannel(activityChannels[i % 2]);
    i++;
  }
}

async function start_game(message){
  var connection = await message.member.voice.channel.join();
  var broadcast = client.voice.createBroadcast();

  var selectedUser = get_random_person(message);
  
  broadcast.play(
    discordTTS.getVoiceStream(
      "Welcome to Heads Up. "
    )
  );
  await connection.play(broadcast);

  start_round(message, connection, broadcast, '224294800642408451', 'some word');

}

async function start_round(message, connection, broadcast, selectedUser, word){
  // message.guild.voiceStates.cache.forEach(member => (member.id === selectedUser)? member.setDeaf(true): member.setDeaf(false))

  // broadcast.play(
  //   discordTTS.getVoiceStream(
  //     "Brushing your teeth"
  //   )
  // );
  // await connection.play(broadcast);

  // setTimeout(unDeafen, 5000, message);
  // await setTimeout(transcription_of_user, 3000, connection, selectedUser, message, '');
  var results = await transcription_of_user(connection, broadcast, selectedUser, message, '')
  // console.log(results)

  // await broadcast.play(
  //   discordTTS.getVoiceStream(
  //     "Congrats you've guessed correctly"
  //   )
  // );
  // await connection.play(broadcast);

}

function broadcast_msg(broadcast, connection, msg){
   broadcast.play(
      discordTTS.getVoiceStream(
        msg
      )
    );
    connection.play(broadcast);
}


function get_random_person(message){
  var msg_channel = message.member.voice.channel;
  var randomPerson= getRandomInt(0, msg_channel.members.size)
  var myArray = [...msg_channel.members];

  var idRandomPerson= myArray[randomPerson][0]

  return idRandomPerson
}


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function unDeafen(message){
  message.guild.voiceStates.cache.forEach(member => (member.setDeaf(false)))
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
 
  const broadcast = client.voice.createBroadcast();
  var channelId = "779528239857008641";
  var channel = client.channels.cache.get(channelId);
  channel.join().then((connection) => {
    broadcast.play(
      discordTTS.getVoiceStream(
        // "Welcome to Heads Up. One player will be selected to guess the others actions. If you are right, say correct, if wrong, say pass."
        "Cat"
      )
    );
  const dispatcher = connection.play(broadcast);
    
  });
 
  setTimeout(unDeafen, 5000, message);
  
 }

 
 

client.login(token);

