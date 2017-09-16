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
        img: 'src/img/*.png',
        translations: 'src/_locales/**/*.json',
        bundled_tables: 'src/data/bundled_tables/*.json',
        data: ['src/data/*.txt', 'src/data/*.json'],
        manifest: 'src/meta/manifest.json',
    },

    chrome: {
        manifest: 'platform/chrome/manifest.json',
    },

    firefox: {
        manifest: 'platform/firefox/manifest.json',
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

paths.platform = paths[platform]


const gulp = require('gulp')
    , browserify = require('browserify')
    , source = require('vinyl-source-stream')
    , streamify = require('gulp-streamify')
    , del = require('del')
    , json5 = require('gulp-json5-to-json')
    , mergejson = require('gulp-merge-json')
    , editjson = require('gulp-json-modify')
    , concat = require('gulp-concat')
    , stripjs = require('gulp-strip-comments')
    , zip = require('gulp-vinyl-zip')
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


gulp.task('scripts', gulp.parallel(
    'scripts:content',
    'scripts:github_v1',
    'scripts:popup',
    'scripts:background',
    'scripts:options'))


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
            json5: true,
            fileName: 'bundled_tables.json',
            edit: (obj) => {
                const res = {}
                res[obj.id] = obj
                return res
            },
        }))
        .pipe(json5())
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
            json5: true,
            fileName: 'manifest.json',
        }))
        .pipe(json5())
        .pipe(gulp.dest(paths.dest.manifest))
        .pipe(editjson({ key: 'version', value: package_json.version }))
        .pipe(gulp.dest(paths.dest.manifest))
        .on('end', cb)
})


gulp.task('build', gulp.parallel('scripts', 'pages', 'styles', 'images', 'data', 'manifest'))


gulp.task('clean', (cb) => {
    del(build.platform)
    cb()
})


gulp.task('watch', () => {
    gulp.watch(paths.src.js, gulp.parallel('scripts'))
    gulp.watch(paths.src.html, gulp.parallel('pages'))
    gulp.watch(paths.src.css, gulp.parallel('styles'))
    gulp.watch(paths.src.img, gulp.parallel('images'))
    gulp.watch(paths.src.translations, gulp.parallel('data'))
    gulp.watch(paths.src.bundled_tables, gulp.parallel('data'))
    gulp.watch(paths.src.data, gulp.parallel('data'))
    gulp.watch([paths.src.manifest, paths.platform.manifest], gulp.parallel('manifest'))
})


gulp.task('dist', gulp.series('clean', 'build'), () => {
    return gulp.src(paths.dest.all_files)
        .pipe(zip.dest(paths.dest.dist_archive))
})


gulp.task('default', gulp.series('clean', 'build'))
