/**
 * Created by ben on 07/01/2017.
 */

"use strict";

var sassDir = 'sass/',
    sassFile = 'style.scss',
    sassMain = sassDir.concat(sassFile),
    cssDir = 'css/',
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sassify = require('gulp-sass'),
    maps = require('gulp-sourcemaps'),
    //spritesmith = require('gulp.spritesmith'),
    //buffer = require('vinyl-buffer'),
    //csso = require('gulp-csso'),
    //imagemin = require('gulp-imagemin'),
    //merge = require('merge-stream'),
    del = require('del');

gulp.task('sassify', function () {
    return gulp.src([
            sassMain
        ])
        .on('error', swallowError)
        .pipe(maps.init())
        .pipe(sassify({outputStyle: 'compressed'}))
        .on('error', sassify.logError)
        .pipe(maps.write('./'))
        .pipe(gulp.dest(cssDir))
});

gulp.task('createSprites', function () {
    var spriteData = gulp.src('img/avatars/*.jpg')
        .pipe(spritesmith({
            imgName: 'avatarsLG.png',
            cssName: 'spriteLGCSS.css'
        }));

    var imgStream = spriteData.img
        .pipe(buffer())
        .pipe(imagemin())
        .pipe(gulp.dest('css/'));

    var cssStream = spriteData.css
        .pipe(csso())
        .pipe(gulp.dest('sass/containers/'))
        .pipe(rename('_spriteLG.scss'));
    return merge(imgStream, cssStream);
    //return spriteData.pipe(gulp.dest('img/sprites/'))
});

gulp.task('sprite', ['createSprites'], function () {
    return gulp.src([
            'sass/containers/spriteLGCSS.css'
        ])
        .pipe(rename('_spriteLG.scss'))
        .pipe(gulp.dest('sass/containers/'))
});

//gulp.task('clean', function() {
//    return gulp.src([
//        'css/*',
//        'js/*',
//    ])
//});

gulp.task("concatScripts", function () {
    return gulp.src([
            'js/lightboxjs/lightbox.js'
        ])
        .on('error', swallowError)
        .pipe(concat('app.js'))
        .pipe(gulp.dest('js'));
});

gulp.task("minifyScripts", ["concatScripts"], function () {
    return gulp.src(['js/app.js'])
        .pipe(maps.init())
        .pipe(uglify())
        .on('error', swallowError)
        .pipe(rename('app.min.js'))
        .pipe(maps.write('./'))
        .pipe(gulp.dest('js'));
});

gulp.task('watch', function () {
    gulp.watch(['sass/**/*.scss', 'sass/*.scss'], ['sassify']);
    gulp.watch('js/lightboxjs/lightbox.js', ['minifyScripts']);
});

gulp.task('build', ['minifyScripts'], function () {
    return gulp.src([
            'css/style.css*',
            'css/avatars.png',
            'css/avatarsLG.png',
            'img/**',
            'js/app.min.js*',
            '*.html'
        ],
        {base: './'})
        .pipe(gulp.dest('dist'))
});

function swallowError(error) {
    console.log(error.toString());
    this.emit('end');
}

gulp.task('default', function () {
    gulp.start('build');
});