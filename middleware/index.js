class Middleware {
    constructor() {
      this.jwt = require("jsonwebtoken");
      this.messages = require("../messages/auth.messages")
    }
    // authentication middleware
    authenticate = async (req, res, next) => {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];
      if (!token) {
        // Token is missing, return 401 Unauthorized
        return res.status(401).send({
          message: this.messages.allMessages.AUTHORIZATION_FAILED,
        });
      } else {
        const tokenParts = token.split(".");
        const decodedToken = this.jwt.decode(token, { complete: true });
        if (tokenParts.length !== 3 || !decodedToken) {
          // Token is missing, return 401 Unauthorized
          return res.status(401).json({
            message: this.messages.allMessages.INVALID_TOKEN,
          });
        }
  
        const payload = this.jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, {
          ignoreExpiration: true,
        });
  
        const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
        if (payload.exp < currentTimestamp) {
          // Token has expired, return 401 Unauthorized
          return res.status(401).send({
            message: this.messages.allMessages.TOKEN_EXPIRED,
          });
        }
        // req.currentUser gives payload so no need to verify token everywhere and get payload
        req.currentUser = payload;
        next();
      }
    };
  }
  module.exports = new Middleware();