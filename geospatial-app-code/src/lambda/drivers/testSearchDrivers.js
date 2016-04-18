var search = require("./searchDrivers.js");

var context = new Object();
context.succeed = function(msg) {
	console.log("context.succeed: " + msg);
};
context.fail = function(msg) {
	console.log("context.fail: " + msg);
};
context.done = function() {
  console.log("context.done");
}

var evt = {
  locations: "-122.404579147696, 37.7906405925751,-122.404579147696, 37.7906405925751"
};

search.handler(evt, context);
