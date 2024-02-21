const Joi = require("joi");
const departmentValidation = Joi.object({
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

module.exports = {
  departmentValidation
};