
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
        socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": " @s [your-search] - Search DuckDuckGo and Wikipedia", "dur":"1m"}));
        return;
    }
    
    if (mdata.m.indexOf("@s ")==0) {
        var s = mdata.m.substring(3).replace(/\W+/g, ' ').replace(/[ ]/g, '+');
        console.log("@s:", s);

        var results = "";
        var m="";

        _gethttps('https://api.duckduckgo.com/?t=chatassistsearch&format=json&q='+s, function(results, status) {
            if (status !== 200) {
                console.log("Duckduckgo search error");
                tryWikipedia(socket, mdata, s);  
            } else {
                try {
                    var data = JSON.parse(results);
                    
                    if (data.Image!='') {
                        m+=data.Image+"#iconsmall\n";
                    }

                    if (data.AnswerType!='' && data.Answer!='') {
                        m+=data.Answer;
                    } else if (data.DefinitionSource!='') {
                        m+=data.Definition+" [ "+data.DefinitionURL+" ]";
                    } else if (data.AbstractSource!='' && data.Abstract!='') {
                        m+=data.Abstract+" [ "+data.AbstractURL+" ]";
                    } else {
                        tryWikipedia(socket, mdata, s);                            
                    }

                    if (m!="") {
                        m += " (via DuckDuckGo: https://www.duckduckgo.com/?q="+s+")";                            
                    }

                    socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": m, "dur":"1h"}));
                } catch (e) {
                    console.log("Duckduckgo search error",e.message);
                    tryWikipedia(socket, mdata, s);  
                }
            }
        });
    }
};

exports.onroomjoin = function(socket, name, room) {
    console.log("Room ID", room, name);
};


function tryWikipedia(socket, mdata, s) {
    var requrl="https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch="+s+"&srlimit=1&srprop=&srenablerewrites=1";
    var m="", results="";
    _gethttps(requrl, function(results, status) {
        if (status !== 200) {
            socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": "Wikipedia search server error.", "dur":"1m"}));
        } else {
            try {
                var data = JSON.parse(results);
                if (data.query.search.length==0) {
                    m = "No quick results found. Try https://www.duckduckgo.com/?q="+s;
                    socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": m, "dur":"1m"}));
                } else { 
                    getWikipediaArticle(socket, mdata, data.query.search[0].title, s);
                }
            } catch (e) {
                console.log(e.message);
                socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": "Wikipedia search json error.", "dur":"1m"}));
            }
        }
    });
}

function getWikipediaArticle(socket, mdata, title, s) {
    var requrl = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exlimit=max&explaintext&exintro&titles="+title+"&redirects=";
    var m="";
    _gethttps(requrl, function(results, status){
        if (status!=200) {
            socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": "Wikipedia search server error.", "dur":"1m"}));
        } else {
            try {
                var data = JSON.parse(results);                
                for (var p in data.query.pages) {
                    m=data.query.pages[p].extract.substring(0,512);
                    if (data.query.pages[p].extract.length>512)
                        m+="...";
                    break;
                }

                if (m!="") {
                    m += " (via Wikipedia: https://en.wikipedia.org/wiki/"+escape(title.replace(/ /g,'_'))+")";  
                    socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": m, "dur":"1h"}));
                } else {
                    m = "No quick results found. Try https://www.duckduckgo.com/?q="+s;
                    socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": m, "dur":"1m"}));
                }
                

            } catch (e) {
                console.log(e.message);
                socket.emit('chatm', JSON.stringify({"t": token, "room": mdata.room, "m": "Wikipedia search json error.", "dur":"1m"}));
            }
        }
    });
}

function _gethttps(url, finish_callback) {
    var results="";
    https.get(url, function(res) {
        if (res.statusCode !== 200) {
            finish_callback(null, res.statusCode);
        } else {
            res.setEncoding('utf8');
            
            res.on('data', function(chunk) { 
                results += chunk; 
            });

            res.on('end', function() {
                finish_callback(results, res.statusCode);
            });
        }
    }).on('error', function(e) {
        console.log(e.message);
        finish_callback(null, 0);
    });
}