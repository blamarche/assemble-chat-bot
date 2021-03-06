
var config = require('./config.js').config;

console.log("Config:");
console.log(config);

if (process.argv.length < 4) {
    console.log("Expected two params: <bot-name> <room-name,...>")
    return;
}

var rooms = process.argv[3].split(',');
var botname = process.argv[2];

console.log("Bot: ", botname);
console.log("Rooms: ", rooms);

var bot = require('./bots/'+botname+'.js');

console.log("Connecting...");

var socket = require('socket.io-client')(config.url);

// *********************************
// Base connection & disconnections
// **********************************
socket.on('connect', function(){
    console.log("Connected. Authenticating...");

    socket.emit("auth", config.token);
});
socket.on('auth', function(d){
    console.log("Logged in.");    
    console.log("Starting ping job");
    sendPing();

    console.log("Bot starting...");    
    bot.init(socket, rooms, config);

    console.log("Joining rooms");
    for (var i=0; i<rooms.length; i++) {
        //attempt to create the rooms before joining
        socket.emit("createroom", JSON.stringify({"t": config.token, "roomname": rooms[i], "maxexptime": '24h', "minexptime": '1h', "isprivate": false}));
        socket.emit("join", JSON.stringify({"t": config.token, "roomname": rooms[i]}));
    }
});
socket.on('auth_error', function(d){
    if (d=='Invalid Token') {
        console.log("Error logging in.");
        process.exit(1);
    } else {
        console.log("Warning:", d); //room already exists, etc
    }
});
socket.on('disconnect', function(){
    bot.shutdown(socket, function() {
        process.exit(0);
    });    
});
process.on('SIGINT', function() {
    console.log("Caught interrupt signal, shutting down...");
    bot.shutdown(socket, function() {
        process.exit(0);
    });
});

function sendPing() {
    socket.emit("ping", JSON.stringify({"t": config.token}));
    setTimeout(sendPing, 149000);//~2.5 minutes. User timeouts every 5 minutes
}

// *************************
// Main Bot hook
// *************************

// Chat events and hooks to bot
socket.on('chatm', function(d) {
    /*
    { 
    avatar: '',
    dur: '48h',
    m: 'some message',
    msgid: 'XXXXXXXX-YYYY-ZZZZ-AAAA-VVVVVVVVVVVV',
    name: 'Lobby',
    nick: 'echobot',
    room: 'lobby',
    t: '',
    time: 1486330476,
    uid: 'XXXXXXXX-YYYY-ZZZZ-AAAA-VVVVVVVVVVVV' }
    */
    bot.onmessage(socket, JSON.parse(d));
});

socket.on('join', function(d) {
    d=JSON.parse(d);
    if (bot.onroomjoin) {
        bot.onroomjoin(socket, d.name, d.room);
    }
});
