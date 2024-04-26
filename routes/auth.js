class AuthRouter {
    constructor() {
      this.router = require("express").Router();
      this.authController = require("../controller/auth.controller");
      this.setRoutes();
    }
  
    setRoutes() {
      this.router.post("/login", this.authController.loginUser);
      this.router.post("/signup", this.authController.signupUser);
      this.router.post("/login/google", this.authController.GoogleSignIn);
      this.router.get("/conn", this.authController.connectionTest);
    }
  }
  
  const router = new AuthRouter();
  module.exports = router.router;