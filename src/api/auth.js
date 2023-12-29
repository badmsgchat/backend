const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {SECRET} = require('../../config');


/**
 * The Authentication API (login, register, logout)
 * @namespace Auth
 */
module.exports = {
  path: "/api",
  routes: (auth, db) => {
    const sendErr = (res, code, msg) => res.status(code).json({err: msg});

    /**
     * @function /api/login POST
     * @memberof Auth
     * @param {string} username
     * @param {string} password
     * @returns {object} JSON object with a token
     * @throws {object} JSON object with a error message (in err)
     */
    router.post("/login", async (req, res)=>{
      const {username, password} = req.body;
      if (!username || !password) return sendErr(res, 400, "Username and password are required.");

      const userHash = await db.hGet(`users:${username}`, 'pwd');
      if (!userHash) return sendErr(res, 401, "The username entered doesn't exist.");
      const pass = await bcrypt.compare(password, userHash);
      if (!pass) return sendErr(res, 401, "The password entered doesn't match.");
      

      const token = jwt.sign({
        username,
        salt: require('crypto').randomBytes(16).toString('hex')  // added salt to the token
      }, SECRET);
      return res.json({ token });
    });

    /**
     * @function /api/register POST
     * @memberof Auth
     * @param {string} username
     * @param {string} password
     * @returns {object} JSON object with a token
     * @throws {object} JSON object with a error message (in err)
     */
    router.post("/register", async (req, res)=>{
      const {username, password} = req.body;
      if (!username || !password) return sendErr(res, 400, "Username and password are required.");
      if ( await db.hGet(`users:${username}`, 'pwd') ) return sendErr(res, 500, "The username is taken.");

      try {
        const hash = await bcrypt.hash(password, 10);
        const token = jwt.sign({
          username,
          salt: require('crypto').randomBytes(16).toString('hex')
        }, SECRET);
  
        await db.hSet(`users:${username}`, 'pwd', hash);
        return res.json({ token });
      } catch (e) {
        // console.log(e);
        return sendErr(res, 500, "Server Error");
      }
    });

    return router;
  }
}