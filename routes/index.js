class IndexRouter {
  constructor() {
    this.privateRouter = require("express").Router();
    this.publicRouter = require("express").Router();
    // this.middleware = require("../../middleware/index");
    this.authRouter = require("./auth");
    this.deptRouter = require("./department");
    this.userRouter = require("./user");
    this.chatRouter = require("./chat")
    this.friendsRouter = require("./friends")
    this.setPublicRoutes();
    this.setPrivateRoutes();
  }

  // Public routes that do not require authentication
  setPublicRoutes() {
    this.publicRouter.use("/", this.authRouter);
  }
  // Private routes that requires authentication
  setPrivateRoutes() {
    this.privateRouter.use("/", this.deptRouter);
    this.privateRouter.use("/", this.userRouter);
    this.privateRouter.use("/", this.chatRouter);
    this.privateRouter.use("/", this.friendsRouter);
  }
}

const router = new IndexRouter();
module.exports = router;



// class UserRouter {
//     constructor() {
//       this.router = require("express").Router();
//       this.authController = require("../controller/auth.controller");
//       this.setRoutes();
//     }
  
//     setRoutes() {
//       this.router.post("/login", this.authController.loginUser);
//     }
//   }
  
//   const router = new UserRouter();
//   module.exports = router.router;