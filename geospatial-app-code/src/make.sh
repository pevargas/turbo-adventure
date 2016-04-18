#!/bin/bash

aws s3 cp --recursive api/ s3://aws-slatern-qwiklab/static/
cd lambda && ./make.sh
