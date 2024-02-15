// some useful utilities
const crypto = require('node:crypto');

module.exports = {
  validateRoom: async (db, id) => {
    try {
      const dataStr = await db.get(`rooms:${id}`);
      if (!dataStr) return false;

      const data = JSON.parse(dataStr);
      return {
        name: data.name,
        creator: data.creator,
        meta: data.meta[0], // public
        private: data.meta[1]
      };
    } catch (e) {
      throw e;
    }
  },
  
  // note: add async later
  randId: (length=12) => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789_-';
    const bytes = crypto.randomBytes(length);
    const res = new Array(length);

    for (let i=0; i<length; i++) {
      res[i] = alphabet[bytes[i] % alphabet.length];
    }
    return res.join('');
  }
}