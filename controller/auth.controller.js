const { User, Department } = require("../models");
const BaseController = require("./base.controller");
class AuthController extends BaseController {
  constructor() {
    super();
    this.validation = require("../validations/auth.validation");
    this.messages = require("../messages/auth.messages");
    this.helpers = require("../helpers/helper");
    this.Op = require("sequelize").Op;
    this.bcrypt = require("bcrypt");
    require("dotenv").config();
  }
  loginUser = async (req, res) => {
    let auth_validation = this.validation.authValidation.validate(req.body);
    if (auth_validation.error) {
      res.status(403).send({
        status: false,
        message: auth_validation.error.details[0].message,
      });
    } else {
      const { email, password } = req.body;

      // login user
      const loginUser = await this.userServices.login(email, password);

      return res.status(loginUser.statusCode).send(loginUser.resObj)
    }
  };

  signupUser = async (req, res) => {
    let signup_validation = this.validation.signUpValidation.validate(req.body);
    if (signup_validation.error) {
      res.status(403).send({
        status: false,
        message: signup_validation.error.details[0].message,
      });
    } else {
      const { first_name, last_name, email, password, department_name } = req.body;

      // signup user
      const signedUpUser = await this.userServices.signUp(first_name, last_name, email, password, department_name);

      return res.status(signedUpUser.statusCode).send(signedUpUser.resObj);
    };
  }

  connectionTest = async (req, res) => {
    res.status(200).send({
      status: true,
      message: "Connection Successful",
    });
  };
}

module.exports = new AuthController();
