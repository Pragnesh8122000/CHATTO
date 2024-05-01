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
      const { first_name, last_name, email, password, department_name, is_google_signup } = req.body;

      // signup user
      const signedUpUser = await this.userServices.signUp(first_name, last_name, email, password, department_name, is_google_signup);

      return res.status(signedUpUser.statusCode).send(signedUpUser.resObj);
    };
  }

  forgetPassword = async (req, res) => {
    let forget_password_validation = this.validation.forgetPasswordValidation.validate(req.body);
    if (forget_password_validation.error) {
      res.status(403).send({
        status: false,
        message: forget_password_validation.error.details[0].message,
      });
    } else {
      const id = req.params.id;
      const { password } = req.body;

      // forget password
      const forgetPassword = await this.userServices.forgetPassword(id, password);

      return res.status(forgetPassword.statusCode).send(forgetPassword.resObj);
    }
  }

  // login user (POST)  /auth/login/google
  GoogleSignIn = async (req, res) => {
    let google_auth_validation = this.validation.googleAuthValidation.validate(
      req.body
    );
    if (google_auth_validation.error) {
      res.status(403).send({
        status: false,
        message: google_auth_validation.error.details[0].message,
        type: "ValidationError",
      });
    } else {
      const { idToken, clientId } = req.body;

      const user = await this.userServices.googleSignIn(idToken, clientId);
      return res.status(user.statusCode).send(user.resObj);
    }
  };

  connectionTest = async (req, res) => {
    res.status(200).send({
      status: true,
      message: "Connection Successful",
    });
  };
}

module.exports = new AuthController();
