
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
        socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": "@s [your-search] - Search duckduckgo answers API", "dur":"1m"}));
        return;
    }
    
    if (mdata.m.indexOf("@s ")==0) {
        var s = mdata.m.substring(3).replace(/\W+/g, ' ').replace(/[ ]/g, '+');
        console.log("@s:", s);

        var results = "";
        var m="";

        https.get('https://api.duckduckgo.com/?t=chatassistsearch&format=json&q='+s, function(res) {
            if (res.statusCode !== 200) {
                socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": "Search server error.", "dur":"1m"}));
            } else {
                res.setEncoding('utf8');
                
                res.on('data', function(chunk) { 
                    results += chunk; 
                });

                res.on('end', function() {
                    try {
                        var data = JSON.parse(results);
                        
                        if (data.Image!='') {
                            m+=data.Image+"#iconsmall\n";
                        }

                        if (data.AnswerType!='') {
                            m+=data.Answer;
                        } else if (data.DefinitionSource!='') {
                            m+=data.Definition+" [ "+data.DefinitionURL+" ]";
                        } else if (data.AbstractSource!='') {
                            m+=data.Abstract+" [ "+data.AbstractURL+" ]";
                        }

                        if (m=="")
                            m = "No quick results found. Try https://www.duckduckgo.com/?q="+s;
                        else
                            m += " (via DuckDuckGo: https://www.duckduckgo.com/?q="+s+")";

                        socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": m, "dur":"1h"}));
                    } catch (e) {
                        console.log(e.message);
                        socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": "Search server error.", "dur":"1m"}));
                    }
                });
            }
        });
    }
};

exports.onroomjoin = function(socket, name, room) {
    console.log("Room ID", room, name);
};
