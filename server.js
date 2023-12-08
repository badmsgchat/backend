const express = require('express'),
    session = require('express-session'),
    app = express(),
    bodyParser = require('body-parser');

const http = require('http').Server(app),
      websocket = require('ws'),
      wss = new websocket.Server({server: http});

  
const conf = require('./config'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt'),
    sqlite3 = require('sqlite3').verbose();

// [ircmp] src/init.js
// [ircmp] src/api/rooms.js
// [ircmp] src/api/pwdchange.js
// [ircmp] src/api/messages/basic.js
// [ircmp] src/routes/login.js
// [ircmp] src/routes/proxy.js
// [ircmp] frontend/front.js

http.listen(conf.PORT, () => {
  console.log('server is listening on port', conf.PORT);
});