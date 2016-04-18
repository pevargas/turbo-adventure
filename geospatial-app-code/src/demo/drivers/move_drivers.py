import boto3
import time
import random
import argparse
from argparse import RawTextHelpFormatter

#Each route array is a collection of straight line roads represented by the coordinates at the 2 ends.
routes = [
			[
	 			[37.778645, -122.414887, 37.793810, -122.395615],
	 			[37.793810, -122.395615, 37.791023, -122.417411],
	 			[37.791023, -122.417411, 37.778645, -122.414887]
			],
			[
	 			[37.790177, -122.422526, 37.785632, -122.459176],
	 			[37.785632, -122.459176, 37.777186, -122.458532],
	 			[37.777186, -122.458532, 37.782062, -122.420648],
	 			[37.782062, -122.420648, 37.790177, -122.422526],
			],
			[
	 			[37.806751, -122.419597, 37.799528, -122.409061],
	 			[37.799528, -122.409061, 37.807869, -122.410606],
	 			[37.807869, -122.410606, 37.806751, -122.419597]
			],
			[
	 			[37.745283, -122.387046, 37.776611, -122.390131],
	 			[37.776611, -122.390131, 37.787431, -122.403478],
	 			[37.787431, -122.403478, 37.798046, -122.405537],
	 			[37.798046, -122.405537, 37.793434, -122.441501],
	 			[37.793434, -122.441501, 37.773067, -122.437445],
	 			[37.773067, -122.437445, 37.775467, -122.419238],
	 			[37.775467, -122.419238, 37.773105, -122.418578],
	 			[37.773105, -122.418578, 37.784443, -122.404255],
	 			[37.784443, -122.404255, 37.774352, -122.391595],
	 			[37.774352, -122.391595, 37.766872, -122.390930],
	 			[37.766872, -122.388977, 37.745283, -122.387046]
			],
			[
	 			[37.784349, -122.472652, 37.793571, -122.397694],
	 			[37.793571, -122.397694, 37.784349, -122.472652]
			],
			[
	 			[37.769437, -122.429932, 37.806400, -122.437473],
	 			[37.806400, -122.437473, 37.769437, -122.429932]
			],
			[
	 			[37.762769, -122.434813, 37.795061, -122.394129],
	 			[37.795061, -122.394129, 37.762769, -122.434813]
			]
		]

driverToRouteMapping = {}
driverToRoadMapping = {}
driverPositionOnRoad = {}

#This contorls the number of discrete positions on road, higher the value slower and smoother the motion
NUMBER_OF_POSITIONS_ON_ROAD = 20

def main():
	parser = argparse.ArgumentParser(
        description='Moves the drivers along the given path',
        formatter_class=RawTextHelpFormatter)

	parser.add_argument("--region", dest="region", help="The AWS region", default="us-east-1")
	args = parser.parse_args()

	print ("in region ", args.region)
	ddb = boto3.client("dynamodb", args.region)

	#All drivers are read once at start, kill and restart this to animate newly added drivers.
	allDrivers = ddb.scan(
		TableName="driver",
		AttributesToGet=['driverId']
		)

	for k , v in allDrivers.items():
		if(k == "Items"):
			while 1:
				time.sleep(1)
				for driverKey in v:
					currentDriver = driverKey.get("driverId").get("S")
					move_driver(currentDriver, ddb)
						

def move_driver(currentDriver, ddb):
	if currentDriver not in driverToRouteMapping:
		#Each driver is assigned a random route when program starts
		driverToRouteMapping[currentDriver] = findRandomRoute();

	if currentDriver not in driverToRoadMapping:
		#Current driver is assigned first road in current route if this is first time
		driverToRoadMapping[currentDriver] = 0
		

	if currentDriver not in driverPositionOnRoad:
		#If current driver has not moved so far place it on start
		driverPositionOnRoad[currentDriver] = 0
		
	#print driverToRouteMapping[currentDriver], driverToRoadMapping[currentDriver], driverPositionOnRoad[currentDriver]

	currentRouteIndex = driverToRouteMapping[currentDriver]
	currentRoadIndex = driverToRoadMapping[currentDriver]
	currentPosition = driverPositionOnRoad[currentDriver]

	x1 = routes[currentRouteIndex][currentRoadIndex][0]
	y1 = routes[currentRouteIndex][currentRoadIndex][1]
	x2 = routes[currentRouteIndex][currentRoadIndex][2]
	y2 = routes[currentRouteIndex][currentRoadIndex][3]
	
	totalXDistance = x2 - x1
	delta = totalXDistance / NUMBER_OF_POSITIONS_ON_ROAD
	currentX = x1 + (delta * currentPosition)
	currentY = y1 + ((y2 - y1)/(x2-x1)) * (currentX - x1)
	update_driver(ddb, currentDriver, currentX, currentY,currentPosition)

	if currentPosition > NUMBER_OF_POSITIONS_ON_ROAD -1:
		resetToNextRoad(currentRoadIndex, currentRouteIndex, currentDriver)

	print "Driver: {0} , X: {1} ,Y: {2}, Route: {3} , Road: {4} , Position: {5}".format(
		currentDriver, currentX , currentY, currentRouteIndex, currentRoadIndex, currentPosition)
	
def findRandomRoute():
	return random.randint(0, len(routes)-1)

def resetToNextRoad(currentRoadIndex, currentRouteIndex, currentDriver):
	#change to next road, reset postion on road to 0
	if currentRoadIndex < len(routes[currentRouteIndex]) -1:
		currentRoadIndex+=1
	else:
		#Teleport driver to another route since thir driver fnished full route
		currentRoadIndex = 0
		driverToRouteMapping[currentDriver] = findRandomRoute();

	driverToRoadMapping[currentDriver] = currentRoadIndex
	driverPositionOnRoad[currentDriver] = 0

def update_driver(ddb, driverId, currentX, currentY, currentPosition):

	response = ddb.update_item(
		TableName="driver",
		Key={
			"driverId": {
				"S": driverId
				}
			},
		AttributeUpdates={
			"location": {
				"Value": {
					"M": {
						"coordinates": {
							"L": [ 
								{"N": str(currentY) },
								{"N": str(currentX) }
							]
						}
					}
				}
			}
		}
	)
	driverPositionOnRoad[driverId] = currentPosition+1
	#print "Updated drvier table: {0}".format(response)

if __name__ == '__main__':
    main()