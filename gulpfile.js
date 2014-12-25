"use strict";

var should = require('should');

var runSequence = require('run-sequence');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

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
    .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('build', function() {
  // todo: uglify, copy, ...
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
