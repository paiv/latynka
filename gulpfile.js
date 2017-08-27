'use strict'


const platform = (process.env.PLATFORM || 'chrome').toLowerCase()


const build = {
    root: 'dist/build/' + platform
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
        js: build.root + '/js',
        html: build.root,
        img: build.root + '/img',
        translations: build.root + '/_locales',
        manifest: build.root,
    }
}

paths.platform = paths[platform]


const gulp = require('gulp')
    , del = require('del')
    , json5 = require('gulp-json5-to-json')
    , mergejson = require('gulp-merge-json')
    , concat = require('gulp-concat')


gulp.task('scripts:content', () => {
    gulp.src([
        paths.src.jsroot + '/settings.js',
        paths.src.jsroot + '/content.js',
        ])
        .pipe(concat('content.js'))
        .pipe(gulp.dest(paths.dest.js))
})


gulp.task('scripts:popup', () => {
    gulp.src([
        paths.src.jsroot + '/settings.js',
        paths.src.jsroot + '/popup.js',
        ])
        .pipe(concat('popup.js'))
        .pipe(gulp.dest(paths.dest.js))
})


gulp.task('scripts:background', () => {
    gulp.src([
        paths.src.jsroot + '/settings.js',
        paths.src.jsroot + '/background.js',
        ])
        .pipe(concat('background.js'))
        .pipe(gulp.dest(paths.dest.js))
})


gulp.task('scripts', ['scripts:content', 'scripts:popup', 'scripts:background'])


gulp.task('pages', () => {
    gulp.src(paths.src.html)
        .pipe(gulp.dest(paths.dest.html))
})


gulp.task('images', () => {
    gulp.src(paths.src.img)
        .pipe(gulp.dest(paths.dest.img))
})


gulp.task('data', () => {
    gulp.src(paths.src.translations)
        .pipe(gulp.dest(paths.dest.translations))
})


gulp.task('manifest', () => {
    gulp.src([paths.src.manifest, paths.platform.manifest])
        .pipe(mergejson({
            json5: true,
            fileName: 'manifest.json',
        }))
        .pipe(json5())
        .pipe(gulp.dest(paths.dest.manifest))
})


gulp.task('build', ['scripts', 'pages', 'images', 'data', 'manifest'])


gulp.task('clean', () => {
    del(build.root)
})


gulp.task('watch', () => {
    gulp.watch(paths.src.js, ['scripts'])
    gulp.watch(paths.src.html, ['pages'])
    gulp.watch(paths.src.img, ['images'])
    gulp.watch(paths.src.translations, ['data'])
    gulp.watch([paths.src.manifest, paths.platform.manifest], ['manifest'])
})


gulp.task('default', ['clean', 'build', 'watch'])
