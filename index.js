const express = require('express'),
      app = express(),
      http = require('http').Server(app),
      {db, auth, wss} = require('./src/init')( http ); // Passes in a http client => return wss
app.use(require('body-parser').json());


// module loader
const modules = [
  'api/auth',
  'api/passchange',
  'api/messages',
  'api/rooms'
];
modules.forEach(module => {
  module = require('./src/' + module);
  app.use(module.path, module.routes(auth, db, wss));
});

const cfg = require('./config');
http.listen(cfg.PORT, ()=>{
  console.log('listening on port', cfg.PORT);
});