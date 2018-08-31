const jwt = require('jsonwebtoken');

module.exports = {
  createToken(payload, secret) {
    return new Promise((resolve) => {
      const token = jwt.sign(payload, secret, {
        expiresIn: 86400, // expires in 24 hours
      });
      resolve(token);
    });
  },
  decodeToken(token, secret) {
    return jwt.verify(token, secret, (err, decodedToken) => {
      if (decodedToken) {
        return decodedToken;
      }
      return false;
    });
  },
};
