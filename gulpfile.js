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

var restartCount = 0;

var VERSION = require('./package.json').version;

gulp.task('connect', function() {
  connect.server({
    port: 8088,
    livereload: true
  });
});

gulp.task('jshint', function() {
  return gulp.src([
      '*.js',
      '{lib,test}/**/*.{js,html}'
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


gulp.task('package', function() {

  gulp.src('index.js', { read: false })
  .pipe(browserify({
    insertGlobals: false,
    debug: false
  })).pipe(rename('anthParticle-' + VERSION + '.js'))
  .pipe(gulp.dest('./build/release'));

  gulp.src('index.js', { read: false })
  .pipe(browserify({
    insertGlobals: false,
    debug: false
  })).pipe(rename('anthParticle-' + VERSION + '.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('./build/release'));

});

gulp.task('build', function() {

  // index
  gulp.src('lib/index.js', { read: false })
    .pipe(browserify({
      insertGlobals: false,
      standalone: 'anthParticle',
      debug: false
    }))
    .pipe(rename('anthParticle.js'))
    .pipe(gulp.dest('./build/'))
    .pipe(gulp.dest('./example/lib/'));

  // loaders
  return gulp.src('lib/loader/xml.js', { read: false})
    .pipe(browserify({
      insertGlobals: false,
      standalone: 'anthParticleXmlParser',
      debug: false
    }))
    .pipe(rename('anthParticle.xmlLoader.js'))
    .pipe(gulp.dest('./build/'))
    .pipe(gulp.dest('./example/lib/'))
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
    'build/**', 'example/**'
  ]).pipe(connect.reload());
});

gulp.task('watch', function() {
  runSequence('connect');
  gulp.watch([
    'lib/**', 'example/**', '!example/lib/**'
  ], function() {
    runSequence('reloadServer', 'restartCount', 'jshint', 'build', 'karmaWatch');
  });
});

gulp.task('test', function() {
  gulp.watch([
    'lib/**', 'test/test-*.js'
  ], function() {
    runSequence('jshint', 'karmaWatch');
  });
});

gulp.task('default', function() {
  // start, for git pre-commit hook
  return runSequence('jshint', 'karma', 'build');
});

gulp.task('release', function() {
  return runSequence('jshint', 'karma', 'build', 'package');
});
