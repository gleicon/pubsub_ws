// gleicon 2010 | http://zenmachine.wordpress.com | http://github.com/gleicon


var sys = require("sys");
var ws = require("./lib/node.ws.js/ws")
var http = require("http");
var qs = require("querystring");

sys.puts('Initializing ws server');

var e_msg = new process.EventEmitter();

server = http.createServer(function (req, res) {
  if (req.url == '/publish') {
    req.on('data', function(d) {
            params = qs.parse(d);
            m = params['body'];
            if (m != null) e_msg.emit('message', m); 
    });
    res.writeHead(200, {'Content-type':'text/plain'});
    res.end();
  } else {
    res.writeHead(404, {'Content-type':'text/plain'});
    res.write('not found');
    res.end();
  }
}).listen(8081);

 ws.createServer(function (websocket) {
    var id;
    websocket.addListener("connect", function (resource) { 
      sys.puts("connect: " + resource);
      id = new Date().getTime(); 
    });

    var l = function(m) { 
      if (m.id != id) websocket.write(m.data);
    }

    e_msg.addListener('message', l)

    var to = setTimeout(function() {
      e_msg.removeListener('message', l);
      sys.puts("timeout from: " + websocket.remoteAddress);
    }, 60 * 1000 * 60);

    websocket.addListener("data", function(data) {
      var o = new Array();
      o['id'] = id;
      o['data'] = data;
      e_msg.emit('message', o);
    });
    
    websocket.addListener("close", function () { 
      e_msg.removeListener('message', l); 
      sys.puts("close");
    });
    
}).listen(8080);


