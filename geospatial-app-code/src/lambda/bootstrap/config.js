var AWS = require("aws-sdk");
var async = require("async");

exports.handler = function(event, context) {

  console.log(JSON.stringify(event));

  var ddb = new AWS.DynamoDB.DocumentClient();
  var properties = {};
  async.series([
    function(callback) {
      var params = {
        TableName: "config",
        Item: {
          setting: "elk",
          host: event.esEndPoint,
          region: event.region
        }
      };
      ddb.put(params, function(err, data) {
        if (err) {
          console.log(err);
          context.fail(err);
        } else {
          console.log(data);
        }
        callback(null, null);
      });
    },
    function(callback) {
      context.done();
      callback(null, null);
    }
  ]);
};
