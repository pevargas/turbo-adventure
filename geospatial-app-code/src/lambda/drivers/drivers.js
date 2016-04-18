console.log('Loading event');
var AWS = require('aws-sdk');
var async = require("async");

exports.handler = function(event, context) {
  console.log("Request received:\n", JSON.stringify(event));
  console.log("Context received:\n", JSON.stringify(context));

  var ddb = new AWS.DynamoDB();
  var driver = event.driver;
  if (event.method == "POST" || event.method == "PUT") {
    var params = {
      TableName: "driver",
      Item: {
        driverId: {
          S: driver.driverId
        },
        car: {
          M: {
            color: {
              S: driver.car.color
            },
            make: {
              S: driver.car.make
            }
          }
        },
        location: {
          M: {
            coordinates: {
              L: [{
                N: driver.location.coordinates[0].toString()

              }, {
                N: driver.location.coordinates[1].toString()
              }]
            }
          }
        }
      }
    };
    ddb.putItem(params, function(err, response) {
      if (err) {
        console.log("PutItem error: " + err);
        context.fail("PutItem error: " + err);
      } else {
        console.log("PutItem success: " + JSON.stringify(response));
        context.succeed(driver);
      }
    });
  } else {
    context.fail("Unrecognized method: " + event.method);
  }
}
