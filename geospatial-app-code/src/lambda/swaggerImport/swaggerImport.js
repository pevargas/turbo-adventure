var AWS = require("aws-sdk");
var async = require("async");
var fs = require("fs");
var path = require("path");
var spawn = require("child_process").spawn;

exports.handler = function(event, context) {

	console.log(JSON.stringify(event));

	var s3 = new AWS.S3();
	var cfn = new AWS.CloudFormation();
	var properties = {};
	async.series([
		function(callback) {
			var params = {
				Bucket: event.bucket,
				Key: event.jarKey
			};
			console.log("fetching jar file. . . ");
			console.log(JSON.stringify(params));
			s3.getObject(params, function(err, data) {
				if (err) {
					console.log(err);
					context.fail(err);
				} else {
					console.log(data);
					var jarFile = "/tmp/" + path.basename(event.jarKey);
					console.log("JAR FILE: " + jarFile);
					properties["jarFile"] = jarFile;
					fs.writeFileSync(jarFile, data.Body);
				}
				callback(null, null);
			});
		},
		function(callback) {
			console.log("describing stack. . . ");
			cfn.describeStacks({StackName: event.stackName}, function(err, data) {
				if ( err ) {
					console.log(err);
					context.fail(err);
				} else {
					console.log(data);
          data.Stacks[0].Outputs.forEach(function(record) {
          	properties[record.OutputKey] = record.OutputValue;
          });
				}
				callback(null, null);
			});
		},
		function(callback) {
			var params = {
				Bucket: event.bucket,
				Key: event.swaggerKey
			};
			console.log("fetching swagger file. . . ");
			console.log(JSON.stringify(params));
			s3.getObject(params, function(err, data) {
				if (err) {
					console.log(err);
					context.fail(err);
				} else {
					console.log(data);
					var swaggerFile = "/tmp/" + path.basename(event.swaggerKey);
					var json = data.Body.toString("utf-8");
					properties["swaggerFile"] = swaggerFile;
					json = json
						.replace(/MyRestaurantLambdaFunctionArn/g, properties.RestaurantLambdaArn)
						.replace(/MyRestaurantSearchLambdaFunctionArn/g, properties.RestaurantSearchLambdaArn)
						.replace(/MyDriverLambdaFunctionArn/g, properties.DriverLambdaArn)
						.replace(/MyDriverSearchLambdaFunctionArn/g, properties.DriverSearchLambdaArn)
						.replace(/MyUserProfileLambdaFunctionArn/g, properties.UserProfileLambdaArn)
						.replace(/MyPredictionLambdaFunctionArn/g, properties.PredictionLambdaArn)
						.replace(/MyLambdaExecutionRoleArn/g, properties.ApplicationExecutionRoleArn)
						.replace(/region/g, event.region);
					console.log("SWAGGER JSON: " + json);
					fs.writeFileSync(swaggerFile, json);
				}
				callback(null, null);
			});
		},
		function(callback) {
			var child = spawn("java", ["-jar", properties["jarFile"], "--region", event.region, "--create", properties["swaggerFile"]]);
			child.stdout.on('data', function(data) {
				console.log('stdout: ' + data);
			});

			child.stderr.on('data', function(data) {
				console.log('stderr: ' + data);
			});

			child.on('error', function(code) {
				// Error NO ENTry = Can not find the file.
				console.log('error: child process exited with code ' + code);
				callback(null, null);
			});

			child.on('close', function(code) {
				console.log('close: child process exited with code ' + code);
				callback(null, null);
			});
		},
		function(callback) {
			context.done();
			callback(null, null);
		}
	]);
}
