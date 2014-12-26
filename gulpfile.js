"use strict";

var should = require('should');

var runSequence = require('run-sequence');
var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var restartCount = 0;

gulp.task('jshint', function() {
  return gulp.src([
      '*.js',
      '{lib,test}/**/*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default', { verbose: true }));
});

gulp.task('test', function() {
  return gulp.src('test/test.js', { read: false })
    .pipe(mocha({
        timeout: 5000,
        reporter: 'spec',
        globals: {
          should: should
        }
    }))
    .on('error', gutil.log);
});

gulp.task('release', function() {
  // todo: browserify, uglify, copy, ...
  gulp.src('index.js')
    .pipe(browserify({
      insertGlobals: false,
      debug: false
    }))
    .pipe(rename('anthParticle.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./build/release'));
});

gulp.task('build', function() {
  // todo: browserify, uglify, copy, ...
  gulp.src('index.js')
    .pipe(browserify({
      insertGlobals: false,
      debug: true
    }))
    .pipe(rename('anthParticle.js'))
    .pipe(gulp.dest('./build/'));
});


gulp.task('restartCount', function() {
  restartCount ++;

  var st = '';
  st += '//////////////////////////////////////////\n';
  st += '/// No.' + restartCount + ' restart.\n';
  st += '//////////////////////////////////////////';

  gutil.log('\n' + st);

});

gulp.task('watch', function() {
  gulp.watch([
    'lib/**', 'test/**'
  ], ['restartCount', 'jshint', 'test', 'build']);
});

gulp.task('default', function() {
  // start
  return runSequence('watch');
});
