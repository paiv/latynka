#!/usr/bin/env node
const gulp = require('./gulp.js')
    , path = require('path')


let gulpfile = path.join(process.env['PWD'], 'gulpfile.js')
let config = require(gulpfile)

let tasks = process.argv.slice(2)
gulp.run(config, ...tasks)
