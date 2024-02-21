class UserRouter {
    constructor() {
      this.router = require("express").Router();
      this.userController = require("../controller/user.controller");
      this.setRoutes();
    }
  
    setRoutes() {
      this.router.get("/user/list", this.userController.getUserList);
      this.router.get("/user/department/list", this.userController.getUserByDeptList);
      this.router.get("/user/:id", this.userController.getSingleUser);
      this.router.post("/user", this.userController.insertUser);
      this.router.put("/user/:id", this.userController.updateUser);
      this.router.delete("/user/:id", this.userController.deleteUser);
    }
  }
  
  const router = new UserRouter();
  module.exports = router.router;