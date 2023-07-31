var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    htmlsant = require('sanitize-html');

var http = require('http').Server(app),
    io = require('socket.io')(http),
    sqlite3 = require('sqlite3').verbose();

var conf = require('./config'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt');

// [ircmp] src/init.js
// [ircmp] src/api/rooms.js
// [ircmp] src/api/pwdchange.js
// [ircmp] src/api/messages/basic.js
// [ircmp] src/routes/login.js
// [ircmp] src/routes/proxy.js
// [ircmp] frontend/front.js

var server = http.listen(conf.PORT, () => {
  console.log('server is listening on port', server.address().port);
});