const Joi = require("joi");
const authValidation = Joi.object({
  email: Joi.string()
    .regex(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i)
    .min(8)
    .max(40)
    .required()
    .messages({
      "string.empty": "email is required",
      "string.max": "Email exceeds maximum length",
      "string.pattern.base": "Please enter a valid email address",
    }),
  password: Joi.string()
    .min(8)
    .max(25)
    .regex(/^[A-Za-z0-9_@-]+$/)
    .required()
    .messages({
      "string.empty": "password is required",
      "string.min": "password is too short",
      "string.max": "password length limit is exceeded",
      "string.pattern.base": "password is invalid",
      "string.alphanum": "Please enter a valid password",
    }),
});

const signUpValidation = Joi.object({
  first_name: Joi.string()
    .min(0)
    .max(25)
    .regex(/^[A-Za-z0-9_@-]+$/)
    .required()
    .messages({
      "string.empty": "first name is required",
      "string.min": "first name is too short",
      "string.max": "first name length limit is exceeded",
      "string.pattern.base": "first name is invalid",
      "string.alphanum": "Please enter a valid first name",
    }),
  last_name: Joi.string()
    .min(0)
    .max(25)
    .regex(/^[A-Za-z0-9_@-]+$/)
    .required()
    .messages({
      "string.empty": "last name is required",
      "string.min": "last name is too short",
      "string.max": "last name length limit is exceeded",
      "string.pattern.base": "last name is invalid",
      "string.alphanum": "Please enter a valid last name",
    }),
  is_google_signup: Joi.boolean().required(),
  email: Joi.string()
    .regex(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i)
    .min(8)
    .max(40)
    .required()
    .messages({
      "string.empty": "email is required",
      "string.max": "Email exceeds maximum length",
      "string.pattern.base": "Please enter a valid email address",
    }),
  // password: Joi.string()
  //   .min(0)
  //   .max(25)
  //   .regex(/^[A-Za-z0-9_@-]+$/)
  //   .required()
  //   .messages({
  //     "string.empty": "password is required",
  //     "string.min": "password is too short",
  //     "string.max": "password length limit is exceeded",
  //     "string.pattern.base": "password is invalid",
  //     "string.alphanum": "Please enter a valid password",
  //   }),
  password: Joi.when('is_google_signup', {
    is: true,
    then: Joi.string().allow(null).messages({
      "any.only": "password must be null"
    }),
    otherwise: Joi.string()
      .min(0)
      .max(25)
      .regex(/^[A-Za-z0-9_@-]+$/)
      .required()
      .messages({
        "string.empty": "password is required",
        "string.min": "password is too short",
        "string.max": "password length limit is exceeded",
        "string.pattern.base": "password is invalid",
        "string.alphanum": "Please enter a valid password",
      }),
  }),
  department_name: Joi.string()
    .min(0)
    .max(25)
    .regex(/^[A-Za-z0-9_@-]+$/)
    .required()
    .messages({
      "string.empty": "department name is required",
      "string.min": "department name is too short",
      "string.max": "department name length limit is exceeded",
      "string.pattern.base": "department name is invalid",
      "string.alphanum": "Please enter a valid department name",
    }),
});

const forgetPasswordValidation = Joi.object({
  password: Joi.string()
    .min(8)
    .max(25)
    .regex(/^[A-Za-z0-9_@-]+$/)
    .required()
    .messages({
      "string.empty": "password is required",
      "string.min": "password is too short",
      "string.max": "password length limit is exceeded",
      "string.pattern.base": "password is invalid",
      "string.alphanum": "Please enter a valid password",
    }),
});

const googleAuthValidation = Joi.object({
  idToken: Joi.string().required(),
  clientId: Joi.string().required(),
});

module.exports = {
  authValidation,
  signUpValidation,
  forgetPasswordValidation,
  googleAuthValidation
};