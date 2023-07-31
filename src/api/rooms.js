app.post('/api/createroom', (req, res) =>{
  if (!req.session.username) {
    return res.sendStatus(401);
  }
  
  const {roomname} = req.body;
  const creator = req.session.username
  const roomId = random.strId(12);

  db.run('INSERT INTO rooms (id, name, creator) VALUES (?, ?, ?)', [roomId, roomname, creator], (err) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.send({ roomId });
    }
  });
})