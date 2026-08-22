const { body } = require('express-validator');
const {
    PASSWORD_MIN_LENGTH,
    PASSWORD_PATTERN,
    PASSWORD_LENGTH_MESSAGE,
    PASSWORD_MESSAGE,
    NAME_MIN_LENGTH,
    NAME_MAX_LENGTH,
    NAME_MESSAGE,
    PHONE_PATTERN,
    PHONE_MESSAGE,
} = require('../constants/validationRules');

const registerValidator = [
    body('name')
        .isLength({ min: NAME_MIN_LENGTH, max: NAME_MAX_LENGTH })
        .withMessage(NAME_MESSAGE),
    body('email')
        .isEmail()
        .withMessage('Must be a valid email address'),
    body('password')
        .isLength({ min: PASSWORD_MIN_LENGTH })
        .withMessage(PASSWORD_LENGTH_MESSAGE)
        .matches(PASSWORD_PATTERN)
        .withMessage(PASSWORD_MESSAGE),
    body('phone')
        .matches(PHONE_PATTERN)
        .withMessage(PHONE_MESSAGE),
    body('address')
        .notEmpty()
        .withMessage('Address is required')
];

const loginValidator = [
    body('emailOrPhone')
        .notEmpty()
        .withMessage('Email or phone number is required')
        .custom((value) => {
            const isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
            const isPhone = PHONE_PATTERN.test(value);
            if (!isEmail && !isPhone) {
                throw new Error('Invalid email or phone number format');
            }
            return true;
        }),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const updateUserValidator = [
    body('name')
        .optional()
        .isLength({ min: NAME_MIN_LENGTH, max: NAME_MAX_LENGTH })
        .withMessage(NAME_MESSAGE),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Must be a valid email address'),
    body('phone')
        .optional()
        // 11, matching the user schema and the register validator. This asked
        // for 10, so a phone update could never pass both this and the schema.
        .matches(PHONE_PATTERN)
        .withMessage(PHONE_MESSAGE),
    body('address')
        .optional()
        .notEmpty()
        .withMessage('Address cannot be empty if provided'),
    body('isBanned')
        .optional()
        .isBoolean()
        .withMessage('isBanned must be a boolean')
];

const forgotPasswordValidator = [
    body('emailOrPhone')
        .notEmpty()
        .withMessage('Email or phone number is required')
        .custom((value) => {
            const isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
            const isPhone = PHONE_PATTERN.test(value);
            if (!isEmail && !isPhone) {
                throw new Error('Invalid email or phone number format');
            }
            return true;
        }),
];

const resetPasswordValidator = [
    body('newPassword')
        .isLength({ min: PASSWORD_MIN_LENGTH })
        .withMessage(PASSWORD_LENGTH_MESSAGE)
        .matches(PASSWORD_PATTERN)
        .withMessage(PASSWORD_MESSAGE),
    body('token')
        .notEmpty()
        .withMessage('Token is required')
];

const changePasswordValidator = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: PASSWORD_MIN_LENGTH })
        .withMessage(PASSWORD_LENGTH_MESSAGE)
        .matches(PASSWORD_PATTERN)
        .withMessage(PASSWORD_MESSAGE)
];

module.exports = { 
    registerValidator, 
    loginValidator, 
    updateUserValidator, 
    forgotPasswordValidator,
    resetPasswordValidator,
    changePasswordValidator
};