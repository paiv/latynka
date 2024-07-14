#!/bin/sh
set -e
npm run --prefix "$CI_PRIMARY_REPOSITORY_PATH" 'build:safari'
(cd "$CI_PROJECT_FILE_PATH"/../../ && ./build.sh)
