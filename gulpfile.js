"use strict";

var should = require('should');

var runSequence = require('run-sequence');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

var browserify = require('gulp-browserify');
var rename = require('gulp-rename');

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
        reporter: 'spec'
    }));
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

gulp.task('watch', function() {
  gulp.watch([
    'lib/**', 'test/**'
  ], ['jshint', 'test']);
});

gulp.task('default', function() {
  // start
  return runSequence('jshint', 'test');
});
