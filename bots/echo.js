
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
    if (mdata.m.indexOf("@echo")==0) {
        console.log("@echo:", mdata.nick, "-", mdata.m.substring(5));
        socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": mdata.m.substring(5), "dur":"1m"}));
    }
};
