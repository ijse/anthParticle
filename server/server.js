
"use strict";
var path = require('path');
var connect = require('connect');
var serveStatic = require('serve-static');

var app = connect();
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
app.use(cookieSession({
  keys: ['secret1', 'secret2']
}));

app.use(bodyParser.urlencoded());

app.use(serveStatic(path.join(__dirname, '../example')));
require('./routes.js').applyRoute(app);

app.use(function onservererror(err, req, res, next) {
  console.log(req.url, err);
  res.end(err);
});

module.exports = app;
