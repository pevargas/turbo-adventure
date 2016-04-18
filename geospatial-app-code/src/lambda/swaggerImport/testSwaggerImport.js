var stream = require("./swaggerImport.js");

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


var evt = {
  "stackName": "geospacial-rec-engine",
  "bucket": "aws-slatern-qwiklab-eu-west-1",
  "jarKey": "api/aws-apigateway-importer-1.0.3-SNAPSHOT-jar-with-dependencies.jar",
  "swaggerKey": "api/restaurantDeliveryApi.swagger.json"
}

stream.handler(evt, context);
