'use strict'


const platform = (process.env.PLATFORM || 'chrome').toLowerCase()


const build = {
    root: 'dist/build',
    platform: 'dist/build/' + platform
}


const paths = {
    src: {
        js: 'src/**/*.js',
        jsroot: 'src/js',
        html: 'src/*.html',
        css: 'src/css/*.css',
        img: 'src/img/*.{png,svg}',
        translations: 'src/_locales/**/*.json',
        bundled_tables: 'src/data/bundled_tables/*.json',
        data: 'src/data/*.{txt,json}',
        manifest: 'src/meta/manifest.json',
    },

    platform: {
        manifest: `platform/${platform}/manifest.json`,
    },

    dest: {
        js: build.platform + '/js',
        html: build.platform,
        css: build.platform + '/css',
        img: build.platform + '/img',
        translations: build.platform + '/_locales',
        data: build.platform + '/data',
        manifest: build.platform,
        all_files: build.platform + '/**/*',
        dist_archive: build.root + '/' + platform + '.zip',
    }
}


const gulp = require('gulp')
    , browserify = require('browserify')
    , fs = require('fs')
    , mergejson = gulp.mergejson
    , source = gulp.source
    , streamify = gulp.streamify
    , stripjs = gulp.stripComments
    , zip = gulp.zip
    , package_json = require('./package.json')


gulp.task('scripts:content', (cb) => {
    var brwsrf = browserify({
        entries: paths.src.jsroot + '/content.js',
        debug: false,
    })

    brwsrf.bundle()
        .pipe(source('./content.js'))
        .pipe(streamify(stripjs()))
        .pipe(gulp.dest(paths.dest.js))
        .on('end', cb)
})


gulp.task('scripts:github_v1', (cb) => {
    var brwsrf = browserify({
        entries: paths.src.jsroot + '/github_v1.js',
        debug: false,
    })

    brwsrf.bundle()
        .pipe(source('./github_v1.js'))
        .pipe(streamify(stripjs()))
        .pipe(gulp.dest(paths.dest.js))
        .on('end', cb)
})


gulp.task('scripts:popup', (cb) => {
    var brwsrf = browserify({
        entries: paths.src.jsroot + '/popup.js',
        debug: false,
    })

    brwsrf.bundle()
        .pipe(source('./popup.js'))
        .pipe(streamify(stripjs()))
        .pipe(gulp.dest(paths.dest.js))
        .on('end', cb)
})


gulp.task('scripts:background', (cb) => {
    var brwsrf = browserify({
        entries: paths.src.jsroot + '/background.js',
        debug: false,
    })

    brwsrf.bundle()
        .pipe(source('./background.js'))
        .pipe(streamify(stripjs()))
        .pipe(gulp.dest(paths.dest.js))
        .on('end', cb)
})


gulp.task('scripts:options', (cb) => {
    var brwsrf = browserify({
        entries: paths.src.jsroot + '/options.js',
        debug: false,
    })

    brwsrf.bundle()
        .pipe(source('./options.js'))
        .pipe(streamify(stripjs()))
        .pipe(gulp.dest(paths.dest.js))
        .on('end', cb)
})


gulp.task('scripts:translate', (cb) => {
    var brwsrf = browserify({
        entries: paths.src.jsroot + '/translate.js',
        debug: false,
    })

    brwsrf.bundle()
        .pipe(source('./translate.js'))
        .pipe(streamify(stripjs()))
        .pipe(gulp.dest(paths.dest.js))
        .on('end', cb)
})


gulp.task('scripts', gulp.parallel(
    'scripts:content',
    'scripts:github_v1',
    'scripts:popup',
    'scripts:background',
    'scripts:options',
    'scripts:translate',
))


gulp.task('pages', (cb) => {
    return gulp.src(paths.src.html)
        .pipe(gulp.dest(paths.dest.html))
        .on('end', cb)
})


gulp.task('styles', (cb) => {
    return gulp.src(paths.src.css)
        .pipe(gulp.dest(paths.dest.css))
        .on('end', cb)
})


gulp.task('images', (cb) => {
    return gulp.src(paths.src.img)
        .pipe(gulp.dest(paths.dest.img))
        .on('end', cb)
})


gulp.task('data:translations', (cb) => {
    return gulp.src(paths.src.translations)
        .pipe(gulp.dest(paths.dest.translations))
        .on('end', cb)
})


gulp.task('data:bundled_tables', (cb) => {
    return gulp.src(paths.src.bundled_tables)
        .pipe(mergejson({
            fileName: 'bundled_tables.json',
            edit: (obj) => {
                const res = {}
                res[obj.id] = obj
                return res
            },
        }))
        .pipe(gulp.dest(paths.dest.data))
        .on('end', cb)
})


gulp.task('data:settings', (cb) => {
    return gulp.src(paths.src.data)
        .pipe(gulp.dest(paths.dest.data))
        .on('end', cb)
})


gulp.task('data', gulp.parallel('data:translations', 'data:bundled_tables', 'data:settings'))


gulp.task('manifest', (cb) => {
    return gulp.src([paths.src.manifest, paths.platform.manifest])
        .pipe(mergejson({
            fileName: 'manifest.json',
            transform: (merged) => {
                merged['version'] = package_json.version
                return merged
            },
        }))
        .pipe(gulp.dest(paths.dest.manifest))
        .on('end', cb)
})


gulp.task('build', gulp.parallel('scripts', 'pages', 'styles', 'images', 'data', 'manifest'))


gulp.task('clean', (cb) => {
    fs.rm(build.platform, {recursive:true, force:true}, cb)
})


gulp.task('dist', gulp.series('clean', 'build'), () => {
    return gulp.src(paths.dest.all_files)
        .pipe(zip.dest(paths.dest.dist_archive))
})


gulp.task('default', gulp.series('clean', 'build'))
