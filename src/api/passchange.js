const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");


/** change a username/password.
*/
module.exports = {
  path: "/api/change",
  routes: ({ auth, db }) => {
    /**
     * @function /api/change/pass POST
     * @memberof Auth
     * @description change the password of an account
     * @param {string} oldpass old password
     * @param {string} newpass new password
     * @returns {status} 200 OK
     * @throws {object} JSON object with error message in err.
     */
    router.post('/pass', [auth], async (req, res) =>{
      const {oldpass, newpass} = req.body;
      const user = req.user.username;

      try {
        const row = await db.hGet(`users:${user}`, 'pwd');
        if (!row) return res.status(404).json({err: "Can't find user"});

        const match = await bcrypt.compare(oldpass, row);
        if (!match) return res.status(400).json({err: "Invalid password"});

        const pnew = await bcrypt.hash(newpass, 10);
        await db.hSet(`users:${user}`, 'pwd', pnew);
        return res.sendStatus(200);
      } catch (e) {
        // console.log(e);
        res.status(500).json({err: "Server Error"});
      }
    });

    
    /** @todo Implement username change API */
    return router;
  }
}