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
        img: 'src/img/*.png',
        translations: 'src/_locales/**/*.json',
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
        img: build.platform + '/img',
        translations: build.platform + '/_locales',
        manifest: build.platform,
        all_files: build.platform + '/**/*',
        dist_archive: build.root + '/' + platform + '.zip',
    }
}

paths.platform = paths[platform]


const gulp = require('gulp')
    , del = require('del')
    , json5 = require('gulp-json5-to-json')
    , mergejson = require('gulp-merge-json')
    , concat = require('gulp-concat')
    , zip = require('gulp-vinyl-zip')


gulp.task('scripts:content', (cb) => {
    return gulp.src([
        paths.src.jsroot + '/settings.js',
        paths.src.jsroot + '/content.js',
        ])
        .pipe(concat('content.js'))
        .pipe(gulp.dest(paths.dest.js))
        .on('end', cb)
})


gulp.task('scripts:popup', (cb) => {
    return gulp.src([
        paths.src.jsroot + '/settings.js',
        paths.src.jsroot + '/popup.js',
        ])
        .pipe(concat('popup.js'))
        .pipe(gulp.dest(paths.dest.js))
        .on('end', cb)
})


gulp.task('scripts:background', (cb) => {
    return gulp.src([
        paths.src.jsroot + '/settings.js',
        paths.src.jsroot + '/background.js',
        ])
        .pipe(concat('background.js'))
        .pipe(gulp.dest(paths.dest.js))
        .on('end', cb)
})


gulp.task('scripts', gulp.parallel('scripts:content', 'scripts:popup', 'scripts:background'))


gulp.task('pages', (cb) => {
    return gulp.src(paths.src.html)
        .pipe(gulp.dest(paths.dest.html))
        .on('end', cb)
})


gulp.task('images', (cb) => {
    return gulp.src(paths.src.img)
        .pipe(gulp.dest(paths.dest.img))
        .on('end', cb)
})


gulp.task('data', (cb) => {
    return gulp.src(paths.src.translations)
        .pipe(gulp.dest(paths.dest.translations))
        .on('end', cb)
})


gulp.task('manifest', (cb) => {
    return gulp.src([paths.src.manifest, paths.platform.manifest])
        .pipe(mergejson({
            json5: true,
            fileName: 'manifest.json',
        }))
        .pipe(json5())
        .pipe(gulp.dest(paths.dest.manifest))
        .on('end', cb)
})


gulp.task('build', gulp.parallel('scripts', 'pages', 'images', 'data', 'manifest'))


gulp.task('clean', (cb) => {
    del(build.platform)
    cb()
})


gulp.task('watch', () => {
    gulp.watch(paths.src.js, ['scripts'])
    gulp.watch(paths.src.html, ['pages'])
    gulp.watch(paths.src.img, ['images'])
    gulp.watch(paths.src.translations, ['data'])
    gulp.watch([paths.src.manifest, paths.platform.manifest], ['manifest'])
})


gulp.task('dist', gulp.series('clean', 'build'), () => {
    return gulp.src(paths.dest.all_files)
        .pipe(zip.dest(paths.dest.dist_archive))
})


gulp.task('default', gulp.series('clean', 'build'))
