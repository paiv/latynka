#!/bin/sh
set -e

WEBEXTPATH="../../dist/build/safari"
DISTPATH="$WEBEXTPATH-app"
RESPATH='app/Latynka Extension/Resources'
IRESPATH='app/Latynka Extension iOS/Resources'

# Prerequisite: npm run build:safari

rm -rf "$RESPATH"/*
mkdir -p "$RESPATH"
cp -r "$WEBEXTPATH"/* "$RESPATH"/
rm -rf "$IRESPATH"/*
mkdir -p "$IRESPATH"
cp -r "$WEBEXTPATH"/* "$IRESPATH"/

exit

xcodebuild -project app/Latynka.xcodeproj -scheme Latynka \
-archivePath "$DISTPATH/Latynka.xcarchive" \
clean archive
