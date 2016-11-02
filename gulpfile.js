'use strict';

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    commentStrip = require('gulp-strip-comments'),
    changed = require('gulp-changed'),
    imagemin = require('gulp-imagemin'),
    minifyCSS = require('gulp-minify-css'),
    ngAnnotate = require('gulp-ng-annotate'),
    closureCompiler = require('gulp-closure-compiler'),
    htmlmin = require('gulp-html-minifier'),
    replace = require('gulp-replace'),
    browserSync = require('browser-sync');


// JSHint task
var hintSrc = ['app/app.module.js', 'app/app.config.js', 'app/app.routes.js',
    'app/components/flashcard/controllers/flashcardController.js',
    'app/components/flashcard/services/flashcardServices.js'
];
gulp.task('jshint', function() {
    gulp.src(hintSrc, {
            base: 'app'
        })
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// compile JS
// Order: libs -> modules' declaration -> modules
var jsSrc = [
        'bower_components/angular/angular.js',
        'bower_components/angular-aria/angular-aria.min.js',
        'bower_components/angular-animate/angular-animate.min.js',
        'bower_components/angular-material/angular-material.min.js',
        'bower_components/angular-sanitize/angular-sanitize.min.js',
        'bower_components/angular-touch/angular-touch.min.js',
        'bower_components/angular-ui-router/release/angular-ui-router.min.js',
        'bower_components/ng-file-upload/ng-file-upload.min.js',
        'bower_components/ng-file-upload/ng-file-upload-shim.min.js',
        'app/app.module.js', 'app/app.config.js', 'app/app.routes.js',
        'app/components/flashcard/controllers/flashcardController.js',
        'app/components/flashcard/services/flashcardServices.js',
        'assets/js/ga.js'
    ],
    jsDst = 'dist/app';

gulp.task('compileJS', function() {
    gulp.src(jsSrc, {
            base: 'app'
        })
        .pipe(ngAnnotate(), {
            remove: true,
            single_quotes: true
        })
        .pipe(closureCompiler({
            compilerPath: './closure-compiler/compiler.jar',
            fileName: 'scripts.min.js',
            compilerFlags: {
                formatting: 'SINGLE_QUOTES'
            },
            continueWithWarnings: true
        }))
        .pipe(replace('http://localhost:3000', 'http://vocabflashcards.torcellite.com:3000'))
        .pipe(commentStrip())
        .pipe(gulp.dest(jsDst));
});

// minify new images
var imgSrc = 'assets/img/**/*',
    imgDst = 'dist/assets/img';
gulp.task('imagemin', function() {
    gulp.src(imgSrc)
        .pipe(changed(imgDst))
        .pipe(imagemin())
        .pipe(gulp.dest(imgDst));
});

// minify new or changed CSS
var cssSrc = ['bower_components/angular-material/angular-material.min.css', 'assets/css/**/*'],
    cssDst = 'dist/assets/css';
gulp.task('minifyCSS', function() {
    gulp.src(cssSrc, {
            base: 'app'
        })
        .pipe(minifyCSS({
            'keepSpecialComments': 0
        }))
        .pipe(concat('styles.min.css'))
        .pipe(gulp.dest(cssDst));
});

// minify index.html
var rootHtmlSrc = ['*.html', 'views/**/*.html'],
    rootHtmlDst = 'dist';
gulp.task('minifyHTML', function() {
    gulp.src(rootHtmlSrc, {
            base: './'
        })
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(replace('<link rel="stylesheet" href="bower_components/angular-material/angular-material.min.css"><link rel="stylesheet" href="assets/css/index.css"><link rel="stylesheet" href="assets/css/palette-yellow-purple.css"><link rel="stylesheet" href="assets/css/vocabulary.com.css">',
            '<link rel="stylesheet" href="assets/css/styles.min.css">'))
        .pipe(replace('<script src="bower_components/angular/angular.js"></script><script src="bower_components/angular-aria/angular-aria.min.js"></script><script src="bower_components/angular-animate/angular-animate.min.js"></script><script src="bower_components/angular-material/angular-material.min.js"></script><script src="bower_components/angular-sanitize/angular-sanitize.min.js"></script><script src="bower_components/angular-touch/angular-touch.min.js"></script><script src="bower_components/angular-ui-router/release/angular-ui-router.min.js"></script><script src="bower_components/ng-file-upload/ng-file-upload.min.js"></script><script src="bower_components/ng-file-upload/ng-file-upload-shim.min.js"></script><script src="app/app.module.js"></script><script src="app/app.config.js"></script><script src="app/app.routes.js"></script><script src="app/components/flashcard/controllers/flashcardController.js"></script><script src="app/components/flashcard/services/flashcardServices.js"></script><script src="assets/js/ga.js"></script>',
            '<script src="app/scripts.min.js"></script>'))
        .pipe(gulp.dest(rootHtmlDst));
});

// copy certain files and folders as is
gulp.task('copy', function() {
    gulp.src('assets/txt/**/*')
        .pipe(gulp.dest('dist/assets/txt'));
});

gulp.task('browser-sync', function() {
    browserSync.init({
      server: {
        baseDir: "./"
      }
    });
});

gulp.task('watch', ['browser-sync'], function() {
    gulp.watch('app/**/*').on('change', browserSync.reload);
    gulp.watch('assets/**/*').on('change', browserSync.reload);
    gulp.watch('views/**/*').on('change', browserSync.reload);
    gulp.watch('*.html').on('change', browserSync.reload);
});

gulp.task('build', ['compileJS', 'minifyCSS', 'imagemin', 'minifyHTML', 'copy'],
    function() {
        // empty callback function
    });
