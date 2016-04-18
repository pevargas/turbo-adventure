var AWS = require("aws-sdk");
var async = require("async");

exports.handler = function(event, context) {

  console.log(JSON.stringify(event));

  var ddb = new AWS.DynamoDB();
  var lambda = new AWS.Lambda();
  var cfn = new AWS.CloudFormation();
  var properties = {};
  async.series([
    function(callback) {
      cfn.describeStacks({
        StackName: event.stackName
      }, function(err, data) {
        if (err) {
          console.log(err);
          context.fail(err);
        } else {
          console.log(data);
          data.Stacks[0].Outputs.forEach(function(record) {
            properties[record.OutputKey] = record.OutputValue;
          });
        }
				callback(null, null);
      });
    },
    function(callback) {
      var params = {
        TableName: "restaurant",
        StreamSpecification: {
          StreamEnabled: true,
          StreamViewType: "NEW_IMAGE"
        }
      };
      ddb.updateTable(params, function(err, data) {
        if (err) {
          console.log(err);
          context.fail(err);
        } else {
          console.log(data);
          console.log("STREAM: " + JSON.stringify(data.TableDescription.LatestStreamArn));
          properties["restaurantStreamArn"] = data.TableDescription.LatestStreamArn;
        }
        callback(null, null);
      });
    },
    function(callback) {
      var params = {
        EventSourceArn: properties.restaurantStreamArn,
        FunctionName: properties.RestaurantStreamLambdaArn,
        Enabled: true,
        StartingPosition: "LATEST"
      };
      console.log(JSON.stringify(properties));
      lambda.createEventSourceMapping(params, function(err, data) {
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
      var params = {
        TableName: "driver",
        StreamSpecification: {
          StreamEnabled: true,
          StreamViewType: "NEW_IMAGE"
        }
      };
      ddb.updateTable(params, function(err, data) {
        if (err) {
          console.log(err);
          context.fail(err);
        } else {
          console.log(data);
          console.log("STREAM: " + JSON.stringify(data.TableDescription.LatestStreamArn));
          properties["driverStreamArn"] = data.TableDescription.LatestStreamArn;
        }
        callback(null, null);
      });
    },
    function(callback) {
      var params = {
        EventSourceArn: properties.driverStreamArn,
        FunctionName: properties.DriverStreamLambdaArn,
        Enabled: true,
        StartingPosition: "LATEST"
      };
      console.log(JSON.stringify(properties));
      lambda.createEventSourceMapping(params, function(err, data) {
        if (err) {
          console.log(err);
          context.fail(err);
        } else {
          console.log(data);
          context.done();
        }
        callback(null, null);
      });
    }
  ]);
};
