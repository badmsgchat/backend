app.get('/messages', (req, res) => {
  if (!req.session.username) {
    return res.sendStatus(401);
  }
  const roomId = req.query.room_id;
  let limit = req.query.limit || null;
  let before = req.query.before || null;

  let q = 'SELECT * FROM messages WHERE room_id = ?';
  let pars = [roomId];
  if (before) {
    q += 'AND created_at < ?';
    pars.push(before);
  }
  q += ' ORDER BY created_at DESC';
  if (limit) {
    q += ' LIMIT ?';
    pars.push(parseInt(limit));
  }
  db.all(q, pars, (err, messages) => {
    if (err) {
      return res.sendStatus(500);
    }
      res.send(messages.reverse());
    });
});

app.get('/messages/:roomid/:user', (req, res) => {
  // This will be (probably??) deprecated soon.
  if (!req.session.username) {
    return res.sendStatus(401);
  }
  var roomId = req.params.roomid;
  var user = req.params.user;
  db.all('SELECT * FROM messages WHERE room_id = ? AND name = ?', [roomId, user], (err, messages) => {
    if (err) {
      return res.sendStatus(500);
    }
    res.send(messages);
  });
});


app.post('/messages', async (req, res) => {
  if (!req.session.username) {
    return res.sendStatus(401);
  }

  const name = req.session.username;
  const { message, pfpuri, room_id } = req.body;
  const msgid = random.msgId(room_id),
        timestamp = Math.floor(Date.now() / 1000);


  var room = await validateRoom(room_id);
  if (room.exists) {
    if (/^\s*$/.test(message)) {
      return res.status(500).send({err: "empty msg"});
    }

    db.run('INSERT INTO messages (id, name, message, pfpuri, room_id, created_at) VALUES (?, ?, ?, ?, ?, ?)', [msgid, name, message.trim(), pfpuri, room_id, timestamp], (err) => {
      if (err) {
        console.error(err.message);
        res.sendStatus(500);
      } else {
        wss.bc(room_id, {ev: "msg", id: msgid, 
                         name, message: message.trim(), pfpuri, 
                         created_at: timestamp});
        res.sendStatus(200);
      }
    });
  } else {
    return res.status(404).send({err: "That room doesn't exist."});
  }
});

// [ircmp] src/api/messages/actions.js