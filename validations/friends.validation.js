const Joi = require("joi");
const friendReqValidation = Joi.object({
    user_code: Joi
        .string()
        .length(6)
        .regex(/^[A-Za-z0-9_@-]+$/)
        .required()
        .messages({
            "string.empty": "user code is required",
            "string.length": "user code length should be 6",
            "string.pattern.base": "user code is invalid",
            "string.alphanum": "Please enter a valid user code",
        }),
});
const responseFriendReqValidation = Joi.object({
    status: Joi
        .string()
        .regex(/^[A-Za-z]+$/)
        .valid("accepted", "rejected")
        .required()
        .messages({
            "string.empty": "status is required",
            "string.pattern.base": "status is invalid",
            "string.alphanum": "Please enter a valid status",
        }),
});

module.exports = {
    friendReqValidation,
    responseFriendReqValidation
};