// gleicon 2010 | http://zenmachine.wordpress.com | http://github.com/gleicon


var sys = require("sys");
var reds = require("./lib/redis-node-client/lib/redis-client").createClient();
var redg = require("./lib/redis-node-client/lib/redis-client").createClient();
var ws = require("./lib/node.ws.js/ws")

sys.puts('Initializing ws server');

var e_msg = new process.EventEmitter();

reds.subscribeTo("TEST:PUBSUB", 
  function (channel, message, subscriptionPattern) {
    redg.get(message, function (e, i) {
        if (!e && (i != null)) e_msg.emit('message', i); 
        }
     );
  });

 ws.createServer(function (websocket) {
    websocket.addListener("connect", function (resource) { 
      sys.puts("connect: " + resource);
    });

    
    var l = function(m) {
        websocket.write(m);
    }

    e_msg.addListener('message', l)

    var to = setTimeout(function() {
      e_msg.removeListener('message', l);
      sys.puts("timeout from: " + websocket.remoteAddress);
    }, 60 * 1000 * 60);

    websocket.addListener("close", function () { 
      e_msg.removeListener('message', l); 
      sys.puts("close");
    });

    
}).listen(8080);


