class BaseController {
    constructor() {
      this.jwt = require("jsonwebtoken");
      this.helper = require("../helpers/helper");
      this.repo = require("../repo/repo");
      this.userServices = require("../services/user.services")
    }
  }
  
  module.exports = BaseController;