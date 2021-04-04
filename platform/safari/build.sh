#!/bin/sh
set -e

WEBEXTPATH="../../dist/build/safari"
DISTPATH="$WEBEXTPATH-app"
RESPATH='app/Latynka Extension/Resources'

# Prerequisite: npm run build:safari

rm -rf "$RESPATH"/*
mv -f "$WEBEXTPATH"/* "$RESPATH"/

exit

xcodebuild -project app/Latynka.xcodeproj -scheme Latynka \
-archivePath "$DISTPATH/Latynka.xcarchive" \
clean archive
