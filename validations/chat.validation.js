const Joi = require("joi");

const createGroupValidation = Joi.object({
    groupName: Joi.string()
        .min(1)
        .max(25)
        .regex(/^[ A-Za-z0-9_@-]+$/)
        .required()
        .messages({
            "string.empty": "group name is required",
            "string.min": "group name is too short",
            "string.max": "group name length limit is exceeded",
            "string.pattern.base": "group name is invalid",
        }),

    description: Joi.string()
        .min(1)
        .max(500)
        .regex(/^[ A-Za-z0-9_@-]+$/)
        .optional()
        .messages({
            "string.empty": "group description is required",
            "string.min": "group description is too short",
            "string.max": "group description length limit is exceeded",
            "string.pattern.base": "group description is invalid",
        }),

    // array of integers
    participants: Joi.array()
        .items(Joi.number())
        .min(1)
        .required()
        .messages({
            'array.base': 'Participants must be an array',
            'any.required': 'Participants is required',
            'number.base': 'Participants must be a number',
            'array.min': 'Participants must have at least 1 participant',
        })
});

const renameGroupValidation = Joi.object({
    newGroupName: Joi.string()
        .min(1)
        .max(25)
        .regex(/^[ A-Za-z0-9_@-]+$/)
        .required()
        .messages({
            "string.empty": "group name is required",
            "string.min": "group name is too short",
            "string.max": "group name length limit is exceeded",
            "string.pattern.base": "group name is invalid",
        }),

    conversationId: Joi.number()
        .required()
        .messages({
            "string.empty": "user_id is required",
            "string.pattern.base": "user_id is invalid",
            "string.alphanum": "Please enter a valid user_id",
        }),
});

module.exports = {
    createGroupValidation,
    renameGroupValidation
};