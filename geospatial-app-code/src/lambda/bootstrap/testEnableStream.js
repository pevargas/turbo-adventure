var stream = require("./enableStream.js");

var context = new Object();
context.succeed = function(message) {
	console.log("context.succeed: " + message);
};
context.fail = function(message) {
	console.log("context.fail: " + message);
};
context.done = function() {
	console.log("context.done");
}

var evt = {
	 RequestType: "Delete",
	 ServiceToken: "arn:aws:lambda:us-east-1:127436723527:function:EnableStream",
	 ResponseURL: "https://cloudformation-custom-resource-response-useast1.s3.amazonaws.com/arn%3Aaws%3Acloudformation%3Aus-east-1%3A127436723527%3Astack/bootcamp/a83e9b60-bca1-11e5-aec2-50d5cd24fac6%7CRestaurantTableStream%7C6dd264d6-7a79-40e3-88c5-dcbb402ee89b?AWSAccessKeyId=AKIAJNXHFR7P7YGKLDPQ&Expires=1452991511&Signature=WZz%2B3sZRADm0N%2FSMLLxBVhVpbAE%3D",
	 StackId: "arn:aws:cloudformation:us-east-1:127436723527:stack/bootcamp/a83e9b60-bca1-11e5-aec2-50d5cd24fac6",
	 RequestId: "6dd264d6-7a79-40e3-88c5-dcbb402ee89b",
	 LogicalResourceId: "RestaurantTableStream",
	 PhysicalResourceId: "bootcamp-RestaurantTableStream-16AJNOZ4J3AHE",
	 ResourceType: "Custom::RestaurantTableStream",
	 ResourceProperties: {
	 	ServiceToken: "arn:aws:lambda:us-east-1:127436723527:function:EnableStream",
	 	TableName: "restaurant"
	 }
};

stream.handler(evt, context);

evt = {
	RequestType: "Create",
	ServiceToken: "arn:aws:lambda:us-east-1:127436723527:function:EnableStream",
	ResponseURL: "https://cloudformation-custom-resource-response-useast1.s3.amazonaws.com/arn%3Aaws%3Acloudformation%3Aus-east-1%3A127436723527%3Astack/bootcamp/e1906620-bca9-11e5-9c45-50d501eed2b3%7CRestaurantTableStream%7Ce30b448b-2137-42cd-b36d-c5c143c4cbf7?AWSAccessKeyId=AKIAJNXHFR7P7YGKLDPQ&Expires=1452994610&Signature=vG%2Boomg1e4iXXYK7Jd3qbAr0vQE%3D",
	StackId: "arn:aws:cloudformation:us-east-1:127436723527:stack/bootcamp/e1906620-bca9-11e5-9c45-50d501eed2b3",
	RequestId: "e30b448b-2137-42cd-b36d-c5c143c4cbf7",
	LogicalResourceId: "RestaurantTableStream",
	ResourceType: "Custom::RestaurantTableStream",
	ResourceProperties: {
		ServiceToken: "arn:aws:lambda:us-east-1:127436723527:function:EnableStream",
		FunctionName: "bootcamp-RestaurantLambda-1SYHDBL6VVMIF",
		TableName: "restaurant" }
};

stream.handler(evt, context);
