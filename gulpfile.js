"use strict";

var runSequence = require('run-sequence');
var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var notify = require('gulp-notify');
var connect = require('gulp-connect');

var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var coverage = require('gulp-coverage');

var restartCount = 0;

gulp.task('connect', function() {
  connect.server({
    port: 8088,
    root: '.',
    livereload: true
  });
});

gulp.task('jshint', function() {
  return gulp.src([
      '*.js',
      '{lib,test}/**/*.{js,html}',
      '!**/jquery.js',
      '!test/html/coverage.html'
    ])
    .pipe(jshint.extract('auto'))
    .pipe(jshint())
    .pipe(notify(function(file) {
      if(file.jshint.success) {
        return false;
      }

      var errors = file.jshint.results.map(function(data) {
        if(data.error) {
          return '(' + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
        }
      }).join('\n');
      return file.relative + " (" + file.jshint.results.length + ' errors)\n' + errors;
    }))
    .pipe(jshint.reporter('default', { verbose: true }));
});

gulp.task('mocha', function() {
  return gulp.src('test/*.js', { read: false })
    .pipe(mocha({
        timeout: 5000,
        reporter: 'spec',
        growl: 'true'
    }))
    .on('error', gutil.log);
});

var karma = require('gulp-karma');
gulp.task('karmaWatch', function(done) {

  return gulp.src('test/test-*.js', { read: false })
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }))
    .on('error', function(err) {
      // throw err;
      console.log(err);
    });
});

gulp.task('karma', function() {
  return gulp.src('test/test-*.js', { read: false })
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }));
});

gulp.task('jsc', function() {
  return gulp.src('test/*.js', { read: false })
    .pipe(coverage.instrument({
      pattern: [ 'index.js', 'lib/**' ],
    }))
    .pipe(mocha())
    .pipe(coverage.report({
      outFile: 'test/html/coverage.html'
    }));
});

gulp.task('package', function() {
  var ver = require('./package.json').version;

  gulp.src('index.js', { read: false })
  .pipe(browserify({
    insertGlobals: false,
    debug: false
  })).pipe(rename('anthParticle-' + ver + '.js'))
  .pipe(gulp.dest('./build/release'));

  gulp.src('index.js', { read: false })
  .pipe(browserify({
    insertGlobals: false,
    debug: false
  })).pipe(rename('anthParticle-' + ver + '.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('./build/release'));

});

gulp.task('build', function() {
  // todo: browserify, uglify, copy, ...
  return gulp.src('index.js', { read: false })
    .pipe(browserify({
      insertGlobals: false,
      debug: false
    }))
    .pipe(rename('anthParticle.js'))
    .pipe(gulp.dest('./build/'))
    .pipe(connect.reload());
});


gulp.task('restartCount', function() {
  restartCount ++;

  var st = '';
  st += '//////////////////////////////////////////\n';
  st += '/// No.' + restartCount + ' restart.\n';
  st += '//////////////////////////////////////////';

  gutil.log('\n' + st);

});

gulp.task('reloadServer', function() {
  return gulp.src([
    'build/**', 'test/html/**'
  ]).pipe(connect.reload());
});

gulp.task('watch', function() {
  runSequence('connect');
  gulp.watch([
    'lib/**', 'test/**'
  ], ['reloadServer', 'restartCount', 'jshint', 'build', 'karmaWatch']);
});

gulp.task('default', function() {
  // start, for git pre-commit hook
  return runSequence('jshint', 'karma', 'build');
});

gulp.task('release', function() {
  return runSequence('jshint', 'karma', 'build', 'package');
});
