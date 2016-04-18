console.log('Loading event');

var AWS = require("aws-sdk");

exports.handler = function(event, context) {
	console.log("Request received:\n", JSON.stringify(event));
	console.log("Context received:\n", JSON.stringify(context));

	var dynamodb = new AWS.DynamoDB.DocumentClient();

	if (event.method == "GET") {
		console.log("Method: " + event.method + ": restaurantId: " + event.restaurantId);
		var params = {
			Key: {
				restaurantId: event.restaurantId
			},
			TableName: "restaurant"
		}

		dynamodb.get(params, function(err, data) {
			if (err) {
				console.log('GetItem error: ' + err);
				context.fail('GetItem error: ' + err);
			} else {
				console.log('GetItem success: ' + data);
				context.succeed(data.Item);
			}
		});
	}
}
