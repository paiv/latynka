#!/bin/sh
set -e
brew install 'node@18'
export PATH="/usr/local/opt/node@18/bin:$PATH"
npm install --prefix "$CI_PRIMARY_REPOSITORY_PATH"
