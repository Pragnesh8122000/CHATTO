const Joi = require("joi");
const HandShakeValidation = Joi.object({
    user_name: Joi.string()
        .min(1)
        .max(25)
        .regex(/^[ A-Za-z0-9_@-]+$/)
        .required()
        .messages({
            "string.empty": "user name is required",
            "string.min": "user name is too short",
            "string.max": "user name length limit is exceeded",
            "string.pattern.base": "user name is invalid",
            "string.alphanum": "Please enter a valid user name",
        }),
    user_id: Joi.number()
        .required()
        .messages({
            "string.empty": "user_id is required",
            "string.pattern.base": "user_id is invalid",
            "string.alphanum": "Please enter a valid user_id",
        }),
    // conversation_id: Joi.string()
    //     .min(1)
    //     .max(3)
    //     .regex(/^[0-9]+$/)
    //     .required()
    //     .messages({
    //         "string.empty": "conversation_id is required",
    //         "string.min": "conversation_id is too short",
    //         "string.max": "conversation_id length limit is exceeded",
    //         "string.pattern.base": "conversation_id is invalid",
    //         "string.alphanum": "Please enter a valid conversation_id",
    //     }),
});

module.exports = {
    HandShakeValidation
};