var sys = require("sys");
var http = require("http");
var redg = require("./lib/redis-node-client/lib/redis-client").createClient();

// http://search.twitter.com/search.json?q=
// http://search.twitter.com/search.json?q=%s&since_id=%s


var twitter_search = http.createClient(80, "search.twitter.com");
var since_id=0;
var timeo=10000;

function searcht() {
    var request="";

    if (since_id == 0 ){
        request = twitter_search.request("GET", "/search.json?q=bit.ly+filter:links&rpp=1", {"host": "search.twitter.com"});
    } else {
        request = twitter_search.request("GET", "/search.json?q=bit.ly+filter:links&rpp=1&since_id="+since_id, {"host": "search.twitter.com"});
    }

    request.end();

    request.on ('response', function (response) {
      var body="";

        response.on("data", function (chunk) {
            body=body+chunk;
        });

        response.on("end", function() {
            res = JSON.parse(body);
            since_id = res["max_id"];
            if (res["results"].length > 0) {
              redg.set("LAST:TWIT", res["results"][0]["text"], function(){});
              redg.publish("TEST:PUBSUB", "LAST:TWIT", function(){});
            }
          });
        });
    setTimeout(searcht, timeo);
};

setTimeout(searcht, 2000);

