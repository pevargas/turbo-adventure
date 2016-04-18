#!/bin/bash

cd bootstrap && mkdir bootstrap_lambda
cp *.js bootstrap_lambda
cp *.json bootstrap_lambda
cd bootstrap_lambda && npm install
zip -r ../bootstrap.zip *
cd ..
rm -Rf bootstrap_lambda
aws s3 cp bootstrap.zip s3://aws-slatern-qwiklab/lambda/
rm bootstrap.zip
cd ..

cd drivers && mkdir drivers_lambda
cp *.js drivers_lambda
cp *.json drivers_lambda
cd drivers_lambda && npm install
zip -r ../drivers.zip *
cd ..
rm -Rf drivers_lambda
aws s3 cp drivers.zip s3://aws-slatern-qwiklab/lambda/
rm drivers.zip
cd ..

cd predictions && mkdir predictions_lambda
cp *.js predictions_lambda
cp *.json predictions_lambda
cd predictions_lambda && npm install
zip -r ../predictions.zip *
cd ..
rm -Rf predictions_lambda
aws s3 cp predictions.zip s3://aws-slatern-qwiklab/lambda/
rm predictions.zip
cd ..

cd restaurants && mkdir restaurants_lambda
cp *.js restaurants_lambda
cp *.json restaurants_lambda
cd restaurants_lambda && npm install
zip -r ../restaurants.zip *
cd ..
rm -Rf restaurants_lambda
aws s3 cp restaurants.zip s3://aws-slatern-qwiklab/lambda/
rm restaurants.zip
cd ..

cd swaggerImporter && mkdir swaggerImporter_lambda
cp *.js swaggerImporter_lambda
cp *.json swaggerImporter_lambda
cd swaggerImporter_lambda && npm install
zip -r ../swaggerImport.zip *
cd ..
rm -Rf swaggerImporter_lambda
aws s3 cp swaggerImport.zip s3://aws-slatern-qwiklab/lambda/
rm swaggerImport.zip
cd ..

cd users && mkdir users_lambda
cp *.js users_lambda
cp *.json users_lambda
cd users_lambda && npm install
zip -r ../users.zip *
cd ..
rm -Rf users_lambda
aws s3 cp users.zip s3://aws-slatern-qwiklab/lambda/
rm users.zip
cd ..
