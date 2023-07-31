app.post('/messages/delete', async (req, res) => {
  if (!req.session.username) {
    return res.sendStatus(401);
  }
  const name = req.session.username;
  const { id } = req.body;
  
  const ownerof = {
    msg: await new Promise((resolve, reject) => {
      db.get('SELECT * FROM messages WHERE id = ? AND name = ?', [id, name], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });  
    }),
    // sorry never nesters
    room: await new Promise((resolve, reject) => {
      db.get('SELECT room_id FROM messages WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {

          const room_id = row.room_id;
          db.get('SELECT * FROM rooms WHERE id = ? AND creator = ?', [room_id, name], (err, room) => {
            if (err) {
              reject(err)
            } else {
              resolve(room);
            }
          })
        }
      });  
    })
  };


  if (ownerof.msg || ownerof.room) {
    db.run('DELETE FROM messages WHERE id = ?', [id], (err) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
        io.to(ownerof.msg.room_id||ownerof.room.id).emit("event", {type: "delete", id});
      }
    });
  } else {
    res.sendStatus(401);
  }

});