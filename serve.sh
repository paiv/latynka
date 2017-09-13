#!/bin/bash

MY_DIR=`cd "$(dirname $BASH_SOURCE[0])" && pwd`

rm -r "$MY_DIR/_site"

pushd "$MY_DIR" > /dev/null

bundle exec jekyll serve --incremental
