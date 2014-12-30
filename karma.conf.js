// Karma configuration
// Generated on Mon Dec 29 2014 10:48:34 GMT+0800 (中国标准时间)

module.exports = function(config) {
  "use strict";
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai', 'browserify'],

    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // 'test/**/*.spec.js': [ 'browserify' ]
      'test/test-*.js': ['browserify']
    },

    browserify: {
      debug: true,
      // fullPath: true,
      // noCommonDir: true,
      // exposeAll: true,
      insertGlobals: false,
      transform: [ 'brfs' ]
    },

    mocha: {
      timeout: 5000
    },

    // list of files / patterns to load in the browser
    files: [
      // "test/**/*.spec.js"
      { pattern: 'lib/**', watched: true, included: false, served: false },
      { pattern: 'index.js', watched: true, included: false, served: false },
      // { pattern: 'test/test-*.js', watched: true, included: true, served: true }
      'test/test-*.js'
      // 'test/test-test.js'
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'growl'],

    // plugins: ['karma-spec-reporter'],

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
        'ChromeSmall'
    ],
    customLaunchers: {
        ChromeSmall: {
            base: 'Chrome',
            flags: ['--window-size=0,0', '--window-position=-1000,0']
        }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
