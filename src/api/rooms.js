app.post('/api/createroom', (req, res) =>{
  const {roomname} = req.body;
  const creator = req.session.username
  const roomId = randId(12);
  db.run('INSERT INTO rooms (id, name, creator) VALUES (?, ?, ?)', [roomId, roomname, creator], (err) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.send({ roomId });
    }
  });
})