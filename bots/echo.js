
var token;

exports.init = function(_socket, _rooms, _config) {
    console.log("echo init");
    token=_config.token;
};

exports.shutdown = function(socket, cb) {
    console.log("shutdown echo");  
    cb();
};

exports.onmessage = function(socket, mdata) {
    // Handle 'standard' @bots command and respond with usage
    if (mdata.m == "@bots") {
        socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": " @echo [message] - Echoes back your message", "dur":"1m"}));
        return;
    }
    
    if (mdata.m.indexOf("@echo ")==0) {
        console.log("@echo:", mdata.nick, "-", mdata.m.substring(5));
        socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": mdata.m.substring(5), "dur":"1m"}));
    }
};

exports.onroomjoin = function(socket, name, room) {
    console.log("Room ID", room, name);
};
