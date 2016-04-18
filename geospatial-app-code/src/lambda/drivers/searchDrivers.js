console.log('Loading event');
var AWS = require('aws-sdk');
var async = require("async");
var qs = require("querystring");
var path = require('path');

var creds = new AWS.EnvironmentCredentials('AWS');
var properties = {};

function query(query, handler) {
  console.log("region is " + properties.esDomain.region + " , endpoint is " + properties.esDomain.endpoint);
  console.log("query is " + query);

  var awsEndpoint = new AWS.Endpoint(properties.esDomain.endpoint);

  var req = new AWS.HttpRequest(awsEndpoint);
  req.region = properties.esDomain.region;
  req.headers['presigned-expires'] = false;
  req.headers['Host'] = awsEndpoint.host;
  req.method = 'POST';
  req.path = path.join('/', 'locations', 'driver', '_search');

  var body = {
    size: 100,
    query: query
  };
  req.body = JSON.stringify(body);

  var signer = new AWS.Signers.V4(req, 'es'); // es: service code
  signer.addAuthorization(creds, new Date());

  var searchES = new AWS.NodeHttpClient();
  var data = "";
  var error = "";
  async.series([
    function(callback) {
      searchES.handleRequest(req, null, function(httpResp) {
          httpResp.on('data', function(chunk) {
            data += chunk;
          });
          httpResp.on('end', function(chunk) {
            if ( chunk )
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

exports.handler = function(event, context) {
  console.log("Request received:\n", JSON.stringify(event));
  console.log("Context received:\n", JSON.stringify(context));

  var ddb = new AWS.DynamoDB();
  async.series([
    function(callback) {
      var params = {
        TableName: "config",
        Key: {
          setting: {
            S: "elk"
          }
        }
      };
      ddb.getItem(params, function(err, data) {
        if (err) {
          console.log("Error retrieving config: " + err);
        } else {
          console.log(JSON.stringify(data));
          var endpoint = data.Item.host.S;
          var region = data.Item.region.S;
          var esDomain = {
            "endpoint": endpoint,
            "region": region
          }
          properties["esDomain"] = esDomain;
        }
        callback(null, null)
      });
    },
    function(callback) {
      var q = {
        filtered: {}
      };
      var locations = qs.unescape(event.locations);
      var coordinates = locations.split(",");
      if (coordinates.length != 4) {
        context.fail("Invalid location params: " + coordinates);
        return;
      }
      q.filtered.filter = {
        geo_bounding_box: {
          coordinates: {
            top_left: {
              lon: parseFloat(coordinates[0]),
              lat: parseFloat(coordinates[1])
            },
            bottom_right: {
              lon: parseFloat(coordinates[2]),
              lat: parseFloat(coordinates[3])
            }
          }
        }
      };
      query(q, function(err, response) {
        if (err) {
          console.log("Search query failed: " + err);
          context.fail("Search query failed: " + err);
        } else {
          console.log(response);
          var drivers = []
          JSON.parse(response).hits.hits.forEach(function(item) {
            drivers.push(item._source)
          })
          context.succeed({
            drivers: drivers
          })
        }
      });
    }
  ]);
}
