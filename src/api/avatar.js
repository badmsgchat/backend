const express = require("express");
const router = express.Router();
const upload = require("multer")({
  storage: require("multer").diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/avatar/");
    },
    filename(req, file, cb) {
      cb(null, encodeURIComponent(req.user.username));
    }
  }),
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("only images are allowed"));
    cb(null, true);
  },

  limits: {
    fileSize: 2 * 1024 * 1024  // 2mb avatar
  }
});

/**
 * Avatar getter/setter API
 * @namespace Avatar
 */
module.exports = {
  path: "/api/avatar",
  routes: ({ auth }) => {
    /**
     * @function /api/avatar/:user GET
     * @memberof Avatar
     * @description gets a image for a avatar
     * @param {string} user the username
     * @returns {file} avatar file
     * @throws {status} 400/500
     */
     router.use("/", express.static(__dirname + "/../../uploads/avatar"));


    /**
     * @function /api/avatar/ POST
     * @memberof Rooms
     * @description sets your avatar to a new one
     * @param {formdata} avatar the avatar file
     * @returns {object} { "success": true }
     * @throws {status} 400/500 
     */    
    router.post("/", auth, upload.single("avatar"), async (req, res)=>{
        if (!req.file) return res.status(400).json({err: "no file provided"});
        res.status(200).json({success: true});
    });


    return router;
  }
}