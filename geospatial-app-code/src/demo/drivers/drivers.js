var AWS = require("aws-sdk");
var async = require("async");
var fs = require("fs");

if (process.argv.length < 5) {
  console.log("Usage: " + __filename + " profile region json");
  process.exit(-1);
}

var profile = process.argv[2];
var creds = new AWS.SharedIniFileCredentials({
  profile: profile
});
AWS.config.credentials = creds;

var region = process.argv[3];

//First install into DynamoDB using the document interface
var ddb = new AWS.DynamoDB.DocumentClient({
  region: region
});

var json = process.argv[4];
var drivers = JSON.parse(fs.readFileSync(json).toString())
async.eachSeries(drivers, function(item, callback) {
  item.location.coordinates = [-122.404579147696, 37.7906405925751]
  var params = {
    TableName: "driver",
    Item: {
      driverId: item.driverId,
      location: item.location,
      car: item.car,
      lastModified: new Date().toString()
    }
  };

  ddb.put(params, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log("Inserted driver: " + item.driverId)
    }
    callback(err, item)
  });
});
