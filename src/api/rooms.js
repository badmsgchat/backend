const express = require("express");
const router = express.Router();
const { randId, validateRoom } = require("../utils");

/**
 * Room creation/meta API
 * @namespace Rooms
 */
module.exports = {
  path: "/api/rooms",
  routes: ({ auth, db }) => {
    /**
     * @function /api/rooms/ POST
     * @memberof Rooms
     * @description creates a new room
     * @param {string} name name of the room
     * @returns {object} { roomid, name, creator }
     * @throws {status} 400/500
     */
    router.post("/", [auth], async (req, res)=>{
      const name = req.body.name;
      const creator = req.user.username;
      const roomid = randId();
      if (!name) return res.sendStatus(400);

      try {
        await db.set(`rooms:${roomid}`, JSON.stringify({ name, creator, meta: [{}, {}] }));
        res.json({ roomid, name, creator });
      } catch (e) {
        res.sendStatus(500);
      }
    });


    /**
     * @function /api/rooms/:roomId/meta GET
     * @memberof Rooms
     * @description fetches metadata of a room
     * @param {string} roomId The room ID
     * @returns {object} { name, creator }
     * @throws {object} JSON object with a error message (in err) 
     */    
    router.get("/:roomId/meta", [auth], async (req, res)=>{
      const { roomId } = req.params;
      const room = await validateRoom(db, roomId);
      if (room) {
        if (req.user.username !== room.creator) delete room.private;  // delete private meta if user isnt room owner.
        res.json({ ...room });
      } else {
        res.status(404).json({err: "Room doesn't exist"});
      }
    });


    return router;
  }
}