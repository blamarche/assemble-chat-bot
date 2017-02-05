# Assemble Chat Bot

This is a simple framework to enable simple creation of bots that connect to the Assemble Web Chat server.

**Please fork and contribute your bot scripts!**

## Usage

First copy the config.sample.js file to config.js, then copy in a user token (the part after the # in the url) from the server you wish to connect to.

```
npm install
nodejs main-bot.js <bot-name> <room-names,...>
```

## Creating a bot

To create a bot, add a .js file to the bots folder that exports the following function signatures. 

```
exports.init = function(socket, rooms, config) {...};

exports.shutdown = function(socket, finished_callback) {...};

exports.onmessage = function(socket, mdata) {...};
``` 

Note: Its not necessary to store any of the init parameters except for the config.token value (if you wish to send messages back in-chat)

### Example message send

```
exports.onmessage = function(socket, mdata) {
    if (mdata.m.indexOf("@echo")==0) {
        console.log("@echo:", mdata.nick, "-", mdata.m.substring(5));
        socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": mdata.m.substring(5), "dur":"1m"}));
    }
};
```

mdata example: 

```
{ 
    avatar: '',
    dur: '48h',
    m: 'some message',
    msgid: 'XXXXXXXX-YYYY-ZZZZ-AAAA-VVVVVVVVVVVV',
    name: 'Lobby',
    room: 'lobby',
    nick: 'echobot',
    time: 1400030400,
    uid: 'XXXXXXXX-YYYY-ZZZZ-AAAA-VVVVVVVVVVVV' 
}
```

Note: There is no protection against infinite message loops. Likewise the onmessage function is called even for the bot's own messages. Be careful!