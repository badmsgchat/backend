const express = require("express");
const router = express.Router();
const { randId, validateRoom } = require('../utils');


/**
 * The Messages API.
 * @namespace Messages
 */
module.exports = {
  path: "/api/messages",
  routes: ({ auth, db, wss }) => {
    const sendErr = (res, code, msg) => res.status(code).json({err: msg});

    /**
     * @function /api/messages/:roomId GET
     * @memberof Messages
     * @description fetch messages from a room
     * @param {string} roomId The room ID
     * @param {number} [limit] maximum number of messages to retrieve (default: 30)
     * @param {number} [before] retrieve messages before UNIX timestamp
     * @returns {array} an array of messages:  [{...}, {...}]
     * @throws {status} 500 Server Error
     */
    router.get('/:roomId', [auth], async (req, res)=>{
      const id = req.params.roomId;
      let limit = parseInt(req.query.limit) || 30;
      let before = parseInt(req.query.before) || '-inf';
  
      try {
        const key = `messages:${id}`,
              messages = await db.zRangeByScoreWithScores(key, before, '+inf', 'LIMIT', 0, limit-1, 'REV');
        
        const fmt = await Promise.all(
          messages.map(async (entry) => {
            const { id, name, msg } = JSON.parse(entry.value);
            return { id, stamp: entry.score,
                    name, msg };
          })
        );

        return res.json(fmt);
      } catch (e) {
        // console.log(e);
        return sendErr(res, 500, "Server Error");
      }
    });



    /**
     * @function /api/messages POST
     * @memberof Messages
     * @description send a message to a room
     * @param {string} roomId The room ID
     * @param {string} msg message content
     * @returns {object} {name: (your username), id: (message id), stamp: (unix time)}
     * @throws {object} JSON object with a error message (in err)
     */
    router.post('/', [auth], async (req, res)=>{
      let { msg, roomId } = req.body;
      const name = req.user.username;
      const msgId = randId(6);
      const stamp = Math.floor(Date.now() / 1000);

      msg = msg.trim();
      if (!msg || /^\s*$/.test(msg)) return sendErr(res, 400, "can't send empty message");


      const room = await validateRoom(db, roomId);
      if (!room) return sendErr(res, 404, "room doesn't exist");

      try {
        await db.zAdd(`messages:${roomId}`, {
          score: stamp,
          value: JSON.stringify({ id: msgId, name, msg })
        });
      } catch (e) {
        // console.log(e);
        return sendErr(res, 500, "Server Error");
      }

      wss.bc(roomId, {ev: `${roomId}:msg`, id: msgId, 
                      name, msg, stamp });
      res.json({ id: msgId, name, stamp });
    });


    /**
     * @function /api/messages/delete POST
     * @memberof Messages
     * @description delete a message from a room
     * @param {string} roomId The room ID
     * @param {string} msgId The message ID
     * @param {number} stamp UNIX timestamp of the message (speeds up deletion process)
     * @returns {status} 200 OK
     * @throws {status} 401 Unauthorized (if you don't own the room/message)
     * @throws {status} 404 Not Found, 500 Server Error
     */
    router.post('/delete', [auth], async (req, res)=>{
      const { roomId, msgId, stamp } = req.body;
      const name = req.user.username;
      const room = await validateRoom(db, roomId);
      if (!room) return res.sendStatus(404);

      try {
        let messages = await db.zRangeByScore(`messages:${roomId}`, stamp, stamp);
        messages = messages.map(msg => JSON.parse(msg));

        let message = messages.find(msg => msg.id === msgId);
        if (!message) return res.sendStatus(404);
        if (message.name !== name && room.creator !== name) return res.sendStatus(401);

        await db.zRem(`messages:${roomId}`, JSON.stringify(message));
        wss.bc(roomId, {ev: `${roomId}:rm`, id: msgId});
        res.sendStatus(200);
      } catch (e) {
        // console.log(e);
        res.sendStatus(500);
      }
    });
    return router;
  }
}