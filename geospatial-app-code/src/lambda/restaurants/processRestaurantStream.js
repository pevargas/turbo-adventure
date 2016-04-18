var AWS = require("aws-sdk");
var DOC = require("dynamodb-doc");
var ddt = require("dynamodb-doc/lib/datatypes.js");
var async = require("async");
var path = require('path');

var ddb = new AWS.DynamoDB();
var ddb_client = new DOC.DynamoDB(ddb);
var creds = new AWS.EnvironmentCredentials('AWS');

console.log('Loading function');

function postToES(esDomain, restaurantId, restaurantPayload, handler) {
  console.log("Region is " + esDomain.region + " , endpoint is " + esDomain.endpoint);
  console.log("RestaurantId is " + restaurantId);
  console.log("Payload is " + restaurantPayload);

  var endpoint = new AWS.Endpoint(esDomain.endpoint);

  var req = new AWS.HttpRequest(endpoint);
  req.region = esDomain.region;
  req.headers['presigned-expires'] = false;
  req.headers['Host'] = endpoint.host;
  req.method = 'POST';
  req.path = path.join('/', 'locations', 'restaurant', restaurantId);
  req.body = restaurantPayload;

  var signer = new AWS.Signers.V4(req, 'es'); // es: service code
  signer.addAuthorization(creds, new Date());

  var send = new AWS.NodeHttpClient();
  var data = "";
  var error = "";
  async.series([
    function(callback) {
      send.handleRequest(req, null, function(httpResp) {
          httpResp.on('data', function(chunk) {
            data += chunk;
          });
          httpResp.on('end', function(chunk) {
            if (chunk)
              data += chunk;
            callback(null, null);
          });
        },
        function(err) {
          error = err;
          console.log('Error: ' + err);
          callback(null, null);
        });
    },
    function(callback) {
      handler(error, data);
      callback(null, null);
    }
  ]);
}

function index(records, callback) {
  numRecords = records.length;
  if (numRecords == 0) {
    callback(null, "No records to insert");
  }
  processedRecords = 0;
  async.eachSeries(records, function(record, inner_callback) {
    //console.log(record.eventID);
    //console.log(record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);

    var dataType = new ddt.DynamoDBDatatype();
    var restaurant = new Object();

    restaurant.price = dataType.formatWireType("N", record.dynamodb.NewImage.price.N);
    restaurant.name = dataType.formatWireType("S", record.dynamodb.NewImage.name.S);
    restaurant.cuisine = dataType.formatWireType("L", record.dynamodb.NewImage.cuisine.L);
    restaurant.location = dataType.formatWireType("M", record.dynamodb.NewImage.location.M);
    restaurant.cuisine_type = dataType.formatWireType("S", record.dynamodb.NewImage.cuisine_type.S);
    restaurant.restaurantId = dataType.formatWireType("S", record.dynamodb.NewImage.restaurantId.S);
    restaurant.lastModified = dataType.formatWireType("S", record.dynamodb.NewImage.lastModified.S);

    console.log("BEGIN INDEX: " + restaurant.restaurantId);
    postToES(esDomain, restaurant.restaurantId, JSON.stringify(restaurant),
      function(err, response) {
        if (err) {
          console.log("ERROR INDEX: " + err);
        } else {
          console.log("END INDEX: " + restaurant.restaurantId);
        }
        processedRecords += 1;
        inner_callback(err, response);
        if (processedRecords == numRecords) {
          callback(err, response);
        }
      });
  });
}

var esDomain = {};
exports.handler = function(event, context) {
  console.log("Number of records: " + event.Records.length);
  async.series([
    function(callback) {
      console.log("Fetching ELK configuration");
      var params = {
        TableName: "config",
        Key: {
          setting: "elk"
        }
      };
      ddb_client.getItem(params, function(err, data) {
        if (err) console.log(err, err.stack);
        console.log("ELK configuration: " + data.Item.host + ", " + data.Item.region)
        esDomain["endpoint"] = data.Item.host;
        esDomain["region"] = data.Item.region;
        callback(null, null)
      });
    },
    function(callback) {
      index(event.Records, callback);
    },
    function(callback) {
      context.succeed("Done processing restaurant stream");
      callback(null, null);
    }
  ]);
};
