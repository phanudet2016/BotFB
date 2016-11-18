var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()

app.use(bodyParser.json())
app.set('port', (process.env.PORT || 4000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/webhook', function(req, res) {
  var key = 'EAAS1ZB8DeZBjsBAP2jZBZBtucXXY2TxgR1fM8wvTsVhtImZAW7dlrwdfqhMm5RsQhfQqENhURt7hAqyMHzC6urnbWftaH6E7FZBZAMlPn0T0xUDZCUemDwN87lxjdSxrKWg2jBNvGOeQMTH70eUq2jZCmbm5wkxKoyWZBA5P6mTMxoBwZDZD'
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === key) {
    console.log("Validating webhook");
    res.send(req.query['hub.challenge'])
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've 
    // successfully received the callback. Otherwise, the request will time out.
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

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;
 
  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

 /* if (isEcho) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s", 
      messageId, appId, metadata);
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s",
      messageId, quickReplyPayload);

    sendTextMessage(senderID, "Quick reply tapped");
    return;
  }*/
  if (messageText) {
    if (messageText == 'ค้นหาร้านอาหาร') {
      findRestaurants(senderID);
    }
    if (messageText == 'ไม่เป็นไร ขอบคุณ') {
      sendTextMessage(senderID, "แน่ใจนะครับ! คุณจะไม่หิวตอนนี้ใช่มั้ย :(");
    }

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'hello':
        sendGreetMessage(senderID);
        break;
      /*case 'quick reply':
        sendQuickReply(senderID);
        break;
      default:
        sendTextMessage(senderID, messageText);*/
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);
  
  if(payload == 'getStart'){
       sendTextMessage(senderID, "สวัสดีครับ :)");
       sendGreetMessage(senderID);
  }
  else if(payload == 'findRestaurant'){
       findRestaurants(senderID);
  }
  else if(payload == 'noThank'){
    setTimeout(function() {
      sendTextMessage(senderID, ":(");
    }, 300)
    setTimeout(function() {
      sendTextMessage(senderID, "แน่ใจนะครับ! คุณจะไม่หิวตอนนี้ใช่มั้ย");
    }, 200)
    setTimeout(function() {
      sendTextMessage(senderID, "หากคุณต้องการมองหาร้านอาหารในปราจีนบุรีอีก เพียงแค่ให้ผมช่วย");
    }, 100)
    
       //sendTextMessage(senderID, "แน่ใจนะครับ! คุณจะไม่หิวตอนนี้ใช่มั้ย :("+"\n"+"หากคุณต้องการมองหาร้านอาหารในปราจีนบุรีอีก เพียงแค่ให้ผมช่วย") 
  } else {
    var result = "";
  }

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  // sendTextMessage(senderID, emoji);
}

function sendGreetMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "นี้คือคู่มือร้านอาหารของคุณในปราจีนบุรี ผมจะช่วยคุณได้อย่างไร",
            buttons: [{
              type: "postback",
              title: "ค้นหาร้านอาหาร",
              payload: "findRestaurant"
            }, {
              type: "postback",
              title: "ไม่เป็นไร ขอบคุณ",
              payload: "noThank"
            }],
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function findRestaurants(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"Cafe Kantary",
            item_url:"",
            image_url:"http://image.free.in.th/v/2013/ij/161117085240.png",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"เลือกที่นี้",
                payload:"fineHere"
              },
              {
                type:"postback",
                title:"ทุกที่ในปราจีนบุรี",
                payload:"everyWhere"
              }]
           },
           {
             title:"Robinson Lifestyle Center",
             item_url:"",
             image_url:"http://www.robinson.co.th/images/201412/gallery2/1-1.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"เลือกที่นี้",
                 payload:"fineHere"
               },
               {
                 type:"postback",
                 title:"ทุกที่ในปราจีนบุรี",
                 payload:"everyWhere"
               }]
            },
        {
             title:"สวนอาหาร บ้านเนินน้ำ",
             item_url:"",
             image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2015/06/01/768c556759d446499cd21aa9896957f8.jpg?v=2",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"เลือกที่นี้",
                 payload:"fineHere"
               },
               {
                 type:"postback",
                 title:"ทุกที่ในปราจีนบุรี",
                 payload:"everyWhere"
               }]
            },
        {
             title:"ร้านอาหารชมชล (Chom Chon Restaurant)",
             item_url:"",
             image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2012/10/07/0e81bf6ad4ef4f2ea4361c7985c027df.jpg",
             subtitle:" ",
             buttons:[
               {
                 type:"postback",
                 title:"เลือกที่นี้",
                 payload:"fineHere"
               },
               {
                 type:"postback",
                 title:"ทุกที่ในปราจีนบุรี",
                 payload:"everyWhere"
               }]
            },
        {
             title:"น่ำเฮียงโภชนา (ฟ้ามุ่ย)",
             item_url:"",
             image_url:"http://i0.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_010.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"เลือกที่นี้",
                 payload:"fineHere"
               },
               {
                 type:"postback",
                 title:"ทุกที่ในปราจีนบุรี",
                 payload:"everyWhere"
               }]
            },
        {
             title:"แอ๊ด ข้าวต้ม กบินทร์บุรี",
             item_url:"",
             image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_012.jpg",
             subtitle:" ",
             buttons:[
               {
                 type:"postback",
                 title:"เลือกที่นี้",
                 payload:"fineHere"
               },
               {
                 type:"postback",
                 title:"ทุกที่ในปราจีนบุรี",
                 payload:"everyWhere"
               }]
            },
        {
             title:"ร้านอาหาร ปาล์มสวีทโฮม กบินทร์บุรี",
             item_url:"",
             image_url:"http://image.free.in.th/v/2013/iq/161118060914.png",
             subtitle:" ",
             buttons:[
               {
                 type:"postback",
                 title:"เลือกที่นี้",
                 payload:"fineHere"
               },
               {
                 type:"postback",
                 title:"ทุกที่ในปราจีนบุรี",
                 payload:"everyWhere"
               }]
            },
        {
             title:"8",
             item_url:"",
             image_url:"http://4.bp.blogspot.com/-egpcFDGy01E/Vlkr5WAocjI/AAAAAAAAAQI/brutzJbSiGo/s1600/%25E0%25B8%2595%25E0%25B9%2589%25E0%25B8%25A1%25E0%25B8%25A2%25E0%25B8%25B3%25E0%25B8%2581%25E0%25B8%25B8%25E0%25B9%2589%25E0%25B8%2587.jpg",
             subtitle:" ",
             buttons:[
               {
                 type:"postback",
                 title:"เลือกที่นี้",
                 payload:"fineHere"
               },
               {
                 type:"postback",
                 title:"ทุกที่ในปราจีนบุรี",
                 payload:"everyWhere"
               }]
            },
        {
             title:"9",
             item_url:"",
             image_url:"http://www.nuania.com/wp-content/uploads/2016/04/Daikon_0035.jpg",
             subtitle:" ",
             buttons:[
               {
                 type:"postback",
                 title:"เลือกที่นี้",
                 payload:"fineHere"
               },
               {
                 type:"postback",
                 title:"ทุกที่ในปราจีนบุรี",
                 payload:"everyWhere"
               }]
            },
        {
             title:"10",
             item_url:"",
             image_url:"http://ed.files-media.com/ud/news/1/145/433857/maiuusushibar27-810x480.jpg",
             subtitle:" ",
             buttons:[
               {
                 type:"postback",
                 title:"เลือกที่นี้",
                 payload:"fineHere"
               },
               {
                 type:"postback",
                 title:"ทุกที่ในปราจีนบุรี",
                 payload:"everyWhere"
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
    qs: { access_token: 'EAAS1ZB8DeZBjsBAP2jZBZBtucXXY2TxgR1fM8wvTsVhtImZAW7dlrwdfqhMm5RsQhfQqENhURt7hAqyMHzC6urnbWftaH6E7FZBZAMlPn0T0xUDZCUemDwN87lxjdSxrKWg2jBNvGOeQMTH70eUq2jZCmbm5wkxKoyWZBA5P6mTMxoBwZDZD' },
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

/*function sendQuickReply(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "What's your favorite movie genre?",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Action",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
        },
        {
          "content_type":"text",
          "title":"Comedy",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
        },
        {
          "content_type":"text",
          "title":"Drama",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
        }
      ]
    }
  };
  callSendAPI(messageData);
}*/

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})
