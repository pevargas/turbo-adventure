var AWS = require('aws-sdk');
var path = require('path');
var async = require("async");

var creds = new AWS.EnvironmentCredentials('AWS');

exports.handler = function(event, context) {

  console.log("endPoint is" + event.esEndPoint);
  var endpoint = new AWS.Endpoint(event.esEndPoint);
  var region = event.region;
  console.log("region is" + region);

  async.series([
    function(callback) {
      createIndex("locations", endpoint, region, context, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log(data);
        }
        callback(null, null);
      });
    },
    function(callback) {
      var body = {
        driver: {
          properties: {
            location: {
              type: "object",
              properties: {
                coordinates: {
                  type: "geo_point"
                }
              }
            }
          }
        }
      };
      updateMapping("driver", body, endpoint, region, context, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log(data);
        }
        callback(null, null);
      });
    },
    function(callback) {
      var body = {
        restaurant: {
          properties: {
            location: {
              type: "object",
              properties: {
                geocoordinate: {
                  type: "geo_point"
                }
              }
            }
          }
        }
      };
      updateMapping("restaurant", body, endpoint, region, context, function(err, data) {
        if (err) {
          console.log(err);
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
}

function createIndex(indexName, endpoint, region, context, handler) {
  console.log("creating locations index");
  var createIndexRequest = buildSimpleRequest(endpoint, region);
  createIndexRequest.method = 'PUT';
  createIndexRequest.path = path.join('/', indexName);
  sendRequest(createIndexRequest, context, handler);
  console.log("Submitted request for creating locations index");
}

function updateMapping(indexType, body, endpoint, region, context, handler) {
  console.log("updating mappings for " + indexType);
  var updateMappingRequest = buildSimpleRequest(endpoint, region);
  updateMappingRequest.method = 'PUT';
  updateMappingRequest.path = path.join('/', 'locations', '_mapping', indexType);
  console.log(updateMappingRequest.path);
  updateMappingRequest.body = JSON.stringify(body);
  console.log("body " + updateMappingRequest.body);
  sendRequest(updateMappingRequest, context, handler);
  console.log("updated mappings for " + indexType);
}

function buildSimpleRequest(endpoint, region) {
  var req = new AWS.HttpRequest(endpoint);
  req.region = region;
  req.headers['presigned-expires'] = false;
  req.headers['Host'] = endpoint.host;
  return req;
}

function sendRequest(req, context, handler) {
  var signer = new AWS.Signers.V4(req, 'es'); // es: service code
  signer.addAuthorization(creds, new Date());

  var send = new AWS.NodeHttpClient();
  var data = ""
  var error = ""
  async.series([
    function(callback) {
      send.handleRequest(req, null, function(httpResp) {
        httpResp.on('data', function(d) {
          data += d;
        });
        httpResp.on('end', function(d) {
          if (d)
            data += d;
          callback(null, null);
        });
      }, function(err) {
        error = err;
        callback(null, null);
      });
    },
    function(callback) {
      handler(error, data);
      callback(null, null);
    }
  ]);
}
