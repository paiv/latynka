#!/bin/sh
-e

npm run --prefix "$CI_PRIMARY_REPOSITORY_PATH" 'build:safari'
"$CI_PROJECT_FILE_PATH"/../../build.sh
