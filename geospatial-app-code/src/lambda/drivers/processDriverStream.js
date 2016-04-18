var AWS = require("aws-sdk");
var DOC = require("dynamodb-doc");
var ddt = require("dynamodb-doc/lib/datatypes.js");
var async = require("async");
var path = require('path');

var ddb = new AWS.DynamoDB();
var ddb_client = new DOC.DynamoDB(ddb);
var creds = new AWS.EnvironmentCredentials('AWS');

console.log('Loading function');

function postToES(esDomain, driverId, driverPayload, handler) {
  console.log("Region is " + esDomain.region + " , endpoint is " + esDomain.endpoint);
  console.log("DriverId is " + driverId);
  console.log("Payload is " + driverPayload);

  var endpoint = new AWS.Endpoint(esDomain.endpoint);

  var req = new AWS.HttpRequest(endpoint);
  req.region = esDomain.region;
  req.headers['presigned-expires'] = false;
  req.headers['Host'] = endpoint.host;
  req.method = 'POST';
  req.path = path.join('/', 'locations', 'driver', driverId);
  req.body = driverPayload;

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
    console.log('DynamoDB Record: %j', record.dynamodb);

    var dataType = new ddt.DynamoDBDatatype();
    var driver = new Object();

    driver.driverId = dataType.formatWireType("S", record.dynamodb.NewImage.driverId.S);
    driver.car = dataType.formatWireType("M", record.dynamodb.NewImage.car.M);
    driver.location = dataType.formatWireType("M", record.dynamodb.NewImage.location.M);
    console.log(JSON.stringify(driver));
    var textDriver = JSON.stringify(driver);

    console.log("BEGIN INDEX: " + driver.driverId);
    postToES(esDomain, driver.driverId, textDriver, function(err, data) {
      if (err) {
        console.log("ERROR INDEX " + err + ": " + driver.driverId);
      } else {
        console.log("END INDEX: " + driver.driverId);
      }
      processedRecords += 1;
      inner_callback(err, data);
      if (processedRecords == numRecords) {
        callback(null, null);
      }
    });
  });
}

var esDomain = {};
exports.handler = function(event, context) {
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
      context.succeed("Done processing driver stream");
      callback(null, null);
    }
  ]);
};
