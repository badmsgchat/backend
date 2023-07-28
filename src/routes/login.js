app.post('/login', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({err: "A server error occurred."});
    }
    if (!user) {
      return res.status(401).json({err: "The username of password you entered is incorrect."});
    }

    bcrypt.compare(password, user.password, function(err, result) {
      if (err) {
        return res.status(500).json({err: "A server error occurred."});
      }
      if (!result) {
        return res.status(401).json({err: "The username of password you entered is incorrect."});
      }
      req.session.username = username;
      res.sendStatus(200);
    });
  });
});

app.post('/register', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  bcrypt.hash(password, 10, function(err, hash) {
    if (err) {
      return res.sendStatus(500);
    }
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function (err) {
      if (err) {
        return res.sendStatus(500);
      }
      req.session.username = username;
      res.sendStatus(200);
    });
  });

});