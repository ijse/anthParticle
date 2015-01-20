
var http = require('http');

var app = require('./server.js');

http.createServer(app).listen(3456);
