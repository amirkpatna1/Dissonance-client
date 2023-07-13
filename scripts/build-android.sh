#!/bin/bash

# Load environment variables from .env file
set -a
. ./.env
set +a

# Build the Cordova Android app
cordova build android
