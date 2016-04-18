var mapping = require("./updateMapping.js");

var context = new Object();
context.succeed = function(message) {
	console.log("context.succeed: " + message);
};
context.fail = function(message) {
	console.log("context.fail: " + message);
};
context.done = function() {
	console.log("context.done");
}

var evt = {esEndPoint: "search-geospatial-rec-engine-ucrxtppazfgzr2erhj6zqizh4a.us-east-1.es.amazonaws.com", region: "us-east-1"}
mapping.handler(evt, context);
