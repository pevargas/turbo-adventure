var AWS = require("aws-sdk");
var fs = require("fs");
var async = require("async");

if ( process.argv.length < 5 ) {
  console.log("Usage: " + __filename + " profile region json");
  process.exit(-1);
}

var profile = process.argv[2];
var region = process.argv[3];
var json = process.argv[4];

var profile = process.argv[2];
var creds = new AWS.SharedIniFileCredentials({
  profile: profile
});
AWS.config.credentials = creds;

//First install into DynamoDB using the document interface
var ddb = new AWS.DynamoDB.DocumentClient({
  region: region
});

var restaurants = JSON.parse(fs.readFileSync(json).toString())
async.eachSeries(restaurants, function iterator(item, callback) {
  item.lastModified = new Date().toString();
  var params = {
    TableName: "restaurant",
    Item: item
  };

  ddb.put(params, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log("Inserted restaurant: " + item.restaurantId)
    }
    callback(err, item)
  });
});
