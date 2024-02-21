class UserRouter {
    constructor() {
      this.router = require("express").Router();
      this.departmentController = require("../controller/department.controller");
      this.setRoutes();
    }
  
    setRoutes() {
      this.router.get("/department/list", this.departmentController.getDepartmentList);
      this.router.get("/department/:id", this.departmentController.getSingleDepartment);
      this.router.post("/department", this.departmentController.insertDepartment);
      this.router.put("/department/:id", this.departmentController.updateDepartment);
      this.router.delete("/department/:id", this.departmentController.deleteDepartment);
    }
  }
  
  const router = new UserRouter();
  module.exports = router.router;