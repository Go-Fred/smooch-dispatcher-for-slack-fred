//Loading environment variables
var dotenv = require('dotenv');
dotenv.config();
dotenv.load();

//Creating lib objects

var express = require('express');
var request = require('request');
var slack_oauth = require('./slackoauth')
var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const bodyParser = require('body-parser');

const PORT=process.env.PORT;
var bot_token = process.env.SLACK_BOT_TOKEN;
var rtm = new RtmClient(bot_token);
var app = express();
var keywordJSON = JSON.parse(process.env.KEYWORDS);
var keywords =[];
var channelIds = [];
var alerts = [];


for (var key of keywordJSON){
  //console.log(key)
  //console.log(key.trigger);
    keywords.push(key.trigger);
    channelIds[key.trigger] = key.channelId;
    alerts[key.trigger] = key.alert
}
 console.log("Json:", keywordJSON[0].trigger)
 console.log("channelIds:", channelIds.payments)
 console.log("keywords:", keywords)
//++++++++++++++   Oauth flow   ++++++++++++++//

app.get('/oauth', function(req, res) {
    slack_oauth.handler(req,res);
});
app.post('/command', function(req, res) {
  res.send('Your ngrok tunnel is up and running!');
});
app.listen(PORT, function () {
    console.log("Example app listening on port " + PORT);
});
app.get('/', function(req, res) {
    res.send('Ngrok is working! Path Hit: ' + req.url);
});

//++++++++++++++   Routing flow   ++++++++++++++//

// Initialize using verification token from environment variables
const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter;
const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN);

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload if you want to cache it
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
//  rtm.sendMessage("Hello!", 'C0LK989EZ');
});
// var inviter;
// var keyword;
// var open_stream;
// var channelid;

  rtm.on(RTM_EVENTS.CHANNEL_JOINED, function handleRtmChannelJoined(channelevent) {
    console.log('Channel Joined:', channelevent.channel.id);
    rtm.sendMessage("Hello!", channelevent.channel.id);
    open_stream = 1;
    channelid = channelevent.channel.id;

    slackEvents.on('message', (event)=> {
      console.log(channelid);
      //console.log(event);
      //rtm.sendMessage("Hello!", 'C3U3BMP1V');
      //console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
      //console.log(event);
    });
});

rtm.start();

// Attach listeners to events by Slack Event "type".
slackEvents.on('message', (event)=> {
//  console.log(event)

  const attachments = event && event.attachments || [];
  //console.log(event);
  for (attachment of attachments){
    //console.log(attachment.pretext);
    for(var keyword of keywords){
      //console.log(keyword);
      if(attachment.pretext == keyword){
        //console.log(channelIds[keyword]);
        console.log(attachment)
        rtm.sendMessage(`${alerts[keyword]} in <#${event.channel}>\n>${attachment.pretext}`, channelIds[keyword]);
      }
    }
  }

  // if (event.subtype == 'channel_join' && event.user == 'U4667BY4U' && open_stream == 1){
  //   inviter = event.inviter;
  //   console.log(inviter);
  // }
  // if (event.user == inviter && event.channel == channelid && open_stream == 1){
  //   console.log(event);
  //   keyword = event.text;
  //   console.log(keyword)
  //   open_stream =0; //Ou bien attendre un STOP du user
  //   rtm.sendMessage("I have set up:", keyword);
  // }
  //rtm.sendMessage("Hello!", 'C3U3BMP1V');
  //console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
  //console.log(event);
});
app.use(bodyParser.json());
app.use('/event', slackEvents.expressMiddleware());
