
var https = require('https');
var token;

exports.init = function(_socket, _rooms, _config) {
    console.log("Search init");
    token=_config.token;
};

exports.shutdown = function(socket, cb) {
    console.log("Shutdown search");  
    cb();
};

exports.onmessage = function(socket, mdata) {
    // Handle 'standard' @bots command and respond with usage
    if (mdata.m == "@bots") {
        socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": " @remindme [minutes]:[message] - Remind yourself of something", "dur":"1m"}));
        return;
    }
    
    if (mdata.m.indexOf("@remindme ")==0) {
        var c = mdata.m.substring(10);
        console.log("@remindme:", c);
        var p = c.split(":");
        var delay = parseInt(p[0]);
        var reminder = (p.length>1) ? p[1] : "?";

        if (!isNaN(delay) && delay>0) {
            delay = delay*1000*60;
            socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": "Okay, "+mdata.nick+", I'll remind you", "dur":"1m"}));
            setTimeout(function(){
                socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": "Hey "+mdata.nick+", "+reminder, "dur":"1h"}));
            }, delay);
        } else
            socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": "Please choose a valid number of minutes", "dur":"1m"}));
    }
};

exports.onroomjoin = function(socket, name, room) {
    console.log("Room ID", room, name);
};