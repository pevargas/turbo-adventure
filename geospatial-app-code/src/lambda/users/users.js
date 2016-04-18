console.log('Loading event');

var AWS = require("aws-sdk");

exports.handler = function(event, context) {
	console.log("Request received:\n", JSON.stringify(event));
	console.log("Context received:\n", JSON.stringify(context));

	var ddb = new AWS.DynamoDB();

	if (event.method == 'POST' || event.method == 'PUT') {
		console.log("METHOD: " + event.method);
		var user = event.user;
		var params = {
			TableName: "userprofile",
			Item: {
				userId: {
					S: user.email
				},
				email: {
					S: user.email
				},
				budgetPreference: {
					N: user.budgetPreference.toString()
				},
				age: {
					N: user.age.toString()
				},
				gender: {
					N: user.gender.toString()
				},
				deliveryAddress: {
					M: {
						address_1: {
							S: user.deliveryAddress.address_1
						},
						address_2: {
							S: user.deliveryAddress.address_2
						},
						city: {
							S: user.deliveryAddress.city
						},
						state: {
							S: user.deliveryAddress.state
						},
						zip: {
							S: user.deliveryAddress.zip
						}
					}
				}
			}
		};
		console.log("PutItem: " + user);
		ddb.putItem(params, function(err, data) {
			if (err) {
				console.log("PutItem error: " + err);
				context.fail("PutItem error: " + err);
			} else {
				console.log("PutItem success: " + data);
				context.succeed(user);
			}
		});
	} else if (event.method == "GET") {
		console.log("METHOD: " + event.method + ":" + event.userId);
		var user = new Object();
		var params = {
			TableName: "userprofile",
			Key: {
				"userId": {
					S: event.userId
				}
			}
		};
		ddb.getItem(params, function(err, data) {
			if (err) {
				console.log("GetItem error: " + err);
				console.fail("GetItem error: " + err);
			} else {
				user.userId = data.Item.userId.S;
				user.email = data.Item.email.S;
				user.age = data.Item.age.N;
				user.gender = data.Item.gender.N;
				user.budgetPreference = data.Item.budgetPreference.N;
				user.deliveryAddress = {
					address_1: data.Item.deliveryAddress.M.address_1.S,
					address_2: data.Item.deliveryAddress.M.address_2.S,
					city: data.Item.deliveryAddress.M.city.S,
					state: data.Item.deliveryAddress.M.state.S,
					zip: data.Item.deliveryAddress.M.zip.S,
				};
				context.succeed(user);
			}
		});
	} else {
		context.fail("Unsupported method type: " + event.method);
	}
}
