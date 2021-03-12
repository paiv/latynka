#!/bin/sh
set -e

WEBEXTPATH="../../dist/build/safari"
DISTPATH="$WEBEXTPATH-app"

# Prerequisite: npm run build:safari

mv -f "$WEBEXTPATH"/* 'app/Latynka Extension/Resources/'

xcodebuild -project app/Latynka.xcodeproj -scheme Latynka \
-archivePath "$DISTPATH/Latynka.xcarchive" \
clean archive
