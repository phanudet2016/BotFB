var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()

app.use(bodyParser.json())
app.set('port', (process.env.PORT || 4000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/webhook', function(req, res) {
  var key = 'EAAKfIEoFAOQBABQ072vZAfboOxN82hoaBPLUqovfWcguKLhYqwIb35zuZCniPWqxMREhbZCR8m6kUjOOOv7xKDSOckHG7MiORWHD7cjAS8uHJbQLrydwzR1gYr3d4Tcy2FhEY612ZCYVCjWcPt0CGhbj53wYUAZBl2nctZCbTpXQZDZD'
  if (req.query['hub.verify_token'] === key) {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});
  
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {
    if (messageText === 'hello') {
      sendTextMessage(senderID, "สวัสดีจร้า");
    }

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'hello':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}
function sendGenericMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "น้องมะลิ",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "https://scontent.xx.fbcdn.net/t31.0-0/p600x600/14976766_1702147553433618_1178776288358119238_o.jpg",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "เลือกอัลบัมสาวๆ"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "https://scontent.xx.fbcdn.net/v/t1.0-0/s130x130/14947604_1702144870100553_5946651151060590195_n.jpg?oh=aa1e827aa465fab6c06a3dafe7b029fb&oe=58940335",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: 'EAAKfIEoFAOQBABQ072vZAfboOxN82hoaBPLUqovfWcguKLhYqwIb35zuZCniPWqxMREhbZCR8m6kUjOOOv7xKDSOckHG7MiORWHD7cjAS8uHJbQLrydwzR1gYr3d4Tcy2FhEY612ZCYVCjWcPt0CGhbj53wYUAZBl2nctZCbTpXQZDZD' },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

function getStarted(messageData){
  var messageData = {
    recipient: {
      id: recipientId
    },
    "setting_type":"call_to_actions",
  "thread_state":"new_thread",
  "call_to_actions":[
    {
      "payload":"USER_DEFINED_PAYLOAD"
    }
  ]
  }
} "https://graph.facebook.com/v2.6/me/thread_settings?access_token=EAAKfIEoFAOQBABQ072vZAfboOxN82hoaBPLUqovfWcguKLhYqwIb35zuZCniPWqxMREhbZCR8m6kUjOOOv7xKDSOckHG7MiORWHD7cjAS8uHJbQLrydwzR1gYr3d4Tcy2FhEY612ZCYVCjWcPt0CGhbj53wYUAZBl2nctZCbTpXQZDZD" 
  
app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})
