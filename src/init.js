// init express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(session({
  secret: conf.SECRETKEY,
  resave: false,
  saveUninitialized: true
}));

// db connection
var db = new sqlite3.Database("platform.db", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('connected to platform.db');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY NOT NULL UNIQUE,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    pfpuri TEXT NOT NULL,
    room_id TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY NOT NULL UNIQUE,
    name TEXT,
    creator TEXT NOT NULL,
    meta TEXT
  )`);
});

// functions (random ids, validating rooms)
function validateRoom(roomid){
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM rooms WHERE id = ?', [roomid], (err, row)=>{
      if (err){
        console.error(err.message);
        reject(err);
      } else if (row) {
        resolve({exists: true, name: row.name, creator: row.creator});
      } else {
        resolve(false);
      }
    })
  });
}

const random = {
  strId: function(length) {
    // used for rooms

    const string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    var rand = crypto.randomBytes(length);
    var res = new Array(length);
  
    for (let i=0;i<length;i++){
      res[i] = string[rand[i] % string.length]
    }
    return res.join('');
  },
  msgId: function(roomid) {
    // used for messages

    var nums = crypto.randomBytes(4);
    return roomid + (nums[0] * nums[1] * nums[2] * nums[3]);
  }
}


// logout route to destroy session
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.sendStatus(500);
    }
    res.status(200).json({success: true});
  });
});


// ws setup
wss.conn = {};
wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    msg = JSON.parse(msg);

    // room join event
    if (msg && msg.e === 'j') {
      ws.room = msg.room;

      if (!wss.conn[msg.room]) wss.conn[msg.room] = [];
      wss.conn[msg.room].push(ws);
    }
  });

  ws.on('close', ()=>{
    for (const id in wss.conn) {
      wss.conn[id] = wss.conn[id].filter((c) => c !== ws);
    }
  })
});

// broadcast to room
wss.bc = (room, data) => {
  if (wss.conn[room]) {
    wss.conn[room].forEach((c) => {
      if (c.readyState === websocket.OPEN) {
        c.send(JSON.stringify(data));
      }
    });
  }
}