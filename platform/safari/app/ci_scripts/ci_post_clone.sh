#!/bin/sh
set -e
brew install 'node@18'
npm install --prefix "$CI_PRIMARY_REPOSITORY_PATH"
