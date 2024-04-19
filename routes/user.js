class UserRouter {
    constructor() {
      this.router = require("express").Router();
      this.userController = require("../controller/user.controller");
      this.setRoutes();
    }
  
    setRoutes() {
      this.router.get("/users/list", this.userController.getUserList);
      this.router.get("/users/department/list", this.userController.getUserByDeptList);
      this.router.get("/users/:id", this.userController.getSingleUser);
      this.router.post("/users", this.userController.insertUser);
      this.router.put("/users/:id", this.userController.updateUser);
      this.router.delete("/users/:id", this.userController.deleteUser);
      this.router.put("/users/status/:id", this.userController.UpdateUserStatus);
    }
  }
  
  const router = new UserRouter();
  module.exports = router.router;