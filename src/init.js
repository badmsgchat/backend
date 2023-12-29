// Loads basic things into the server
// also the websocket server source
const jwt = require('jsonwebtoken');
const {createClient} = require('redis');


module.exports = (http) => {
  // connect database
  (async ()=>{
    db = createClient();
    db.on('error', e => console.log(e));
    await db.connect();
  })();


  // auth middleware
  const auth = async (req, res, next)=>{
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({err: "Unauthorized"});

    try {
      const decoded = jwt.verify(token, require('../config').SECRET);
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({err: "Invalid token"});
    }
  };


  
  // websocket setup, add helper functions.
  const { Server } = require('ws');
  const wss = new Server({server: http});

  wss.conn = {};
  wss.on('connection', (ws, req) => {
    // auth timeout
    const authTimeout = setTimeout(()=>{
      ws.close(4401, "Unauthorized");
    }, 10000);


    ws.on('message', async (msg) => {
      msg = JSON.parse(msg);
      
      if (msg && msg.auth) {
        try {
          await jwt.verify(msg.auth, require('../config').SECRET);
          clearTimeout(authTimeout);
        } catch (e) {
          ws.close(4401, "Unauthorized");
        }
      } else {
        // join event
        if (msg && msg.ev === 'j') {
          ws.room = msg.room;
          if (!wss.conn[msg.room]) wss.conn[msg.room] = [];
          wss.conn[msg.room].push(ws);
          ws.send('true');
        }
      }
    });
	
    ws.on('close', ()=>{
      for (const id in wss.conn) {
        wss.conn[id] = wss.conn[id].filter((c) => c !== ws);
      }
    });
  });

  // broadcast function
  wss.bc = (room, data) => {
    if (wss.conn[room]) {
      wss.conn[room].forEach(c => {
        if (c.readyState === 1) { // websocket OPEN
          c.send(JSON.stringify(data));
        }
      });
    }
  };
  return {db, auth, wss};
}