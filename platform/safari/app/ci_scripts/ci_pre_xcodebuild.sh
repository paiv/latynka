#!/bin/sh
set -e
export PATH="/usr/local/opt/node@18/bin:$PATH"
npm run --prefix "$CI_PRIMARY_REPOSITORY_PATH" 'build:safari'
(cd "$CI_PROJECT_FILE_PATH"/../../ && ./build.sh)
