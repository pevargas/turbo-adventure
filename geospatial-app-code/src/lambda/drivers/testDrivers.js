var driver = require("./driver.js");

var context = new Object();
context.succeed = function(msg) {
	console.log("context.succeed: " + msg);
};
context.fail = function(msg) {
	console.log("context.fail: " + msg);
};

var evt = {
	operation: "addDriver",
	driver: {
		driverId: "1061",
		car: {
			make: "Mercedes",
			color: "black"
		},
		location: {
			coordinates: [-122.404579147696, 37.7906405925751]
		}
	}
};

driver.handler(evt, context);
