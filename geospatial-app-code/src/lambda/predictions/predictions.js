console.log('Loading event');

var AWS = require("aws-sdk");
var DOC = require("dynamodb-doc");
var async = require("async");
var qs = require("querystring");

exports.handler = function(event, context) {
	console.log("Request received:\n", JSON.stringify(event));
	console.log("Context received:\n", JSON.stringify(context));

	var ml = new AWS.MachineLearning();
	var ddb = new AWS.DynamoDB.DocumentClient();

	var budgetAndPriceEnum = {
		0: "no_preference",
		1: "under_20",
		2: "20_to_30",
		3: "30_to_50",
		4: "over_50"
	};

	var agesEnum = {
		0: "under_19",
		1: "20_34",
		2: "35_49",
		3: "50_64",
		4: "65_and_over"
	};

	var genderEnum = {
		0: "male",
		1: "female"
	};

	async.waterfall([
		//fetch the config data
		function(callback) {
			ddb.get({
				TableName: "config",
				Key: {
					setting: "ml"
				}
			}, function(err, data) {
				if (err) {
					console.log(err);
					callback(null, null);
				} else {
					console.log("Fetched config: " + JSON.stringify(data.Item));
					callback(null, data.Item)
				}
			});
		},
		//fetch the user
		function(config, callback) {
			ddb.get({
				TableName: "userprofile",
				Key: {
					userId: qs.unescape(event.email)
				}
			}, function(err, data) {
				if (err) {
					console.log(err, err.stack);
					callback(null, null, null);
				} else {
					console.log("Fetched user: " + JSON.stringify(data.Item));
					callback(null, config, data.Item);
				}
			});
		},
		//fetch the restaurant
		function(config, user, callback) {
			ddb.get({
				TableName: "restaurant",
				Key: {
					restaurantId: event.restaurantId
				}
			}, function(err, data) {
				if (err) {
					console.log(err);
					callback(null, null, null, null);
				} else {
					console.log("Fetched restaurant: " + JSON.stringify(data.Item));
					callback(null, config, user, data.Item)
				}
			});
		},
		//do the machine learning prediction
		function(config, user, restaurant, callback) {
			var params = {
				MLModelId: config.modelId,
				PredictEndpoint: config.endpoint,
				Record: {
					age: agesEnum[user.age],
					budget: budgetAndPriceEnum[user.budgetPreference],
					cuisine_type: restaurant.cuisine_type,
					price: budgetAndPriceEnum[restaurant.price],
					gender: genderEnum[user.gender]
				}
			};
			ml.predict(params, function(err, data) {
				if (err) {
					console.log(err);
					context.fail("Unable to generate prediction");
				} else {
					console.log("Generated prediction: " + JSON.stringify(data));
					context.succeed({
						prediction: {
							restaurantId: restaurant.restaurantId,
							userId: user.userId,
							rating: data.Prediction.predictedLabel
						}
					});
				}
			});
		}
	]);
}
