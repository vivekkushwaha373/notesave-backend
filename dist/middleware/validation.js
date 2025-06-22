"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResendOTP = exports.validateGoogleAuth = exports.validateNoteUpdate = exports.validateNote = exports.validateOTP = exports.validateUserLogin = exports.validateUserRegistration = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.type === 'field' ? error.path : 'unknown',
            message: error.msg
        }));
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errorMessages
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
// User registration validation
exports.validateUserRegistration = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    exports.handleValidationErrors
];
// User login validation
exports.validateUserLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
    exports.handleValidationErrors
];
// OTP validation
exports.validateOTP = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    (0, express_validator_1.body)('otp')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be exactly 6 digits')
        .isNumeric()
        .withMessage('OTP must contain only numbers'),
    exports.handleValidationErrors
];
// Note validation
exports.validateNote = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Title must be between 1 and 100 characters'),
    (0, express_validator_1.body)('content')
        .trim()
        .isLength({ min: 1, max: 5000 })
        .withMessage('Content must be between 1 and 5000 characters'),
    exports.handleValidationErrors
];
// Note update validation (optional fields)
exports.validateNoteUpdate = [
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Title must be between 1 and 100 characters'),
    (0, express_validator_1.body)('content')
        .optional()
        .trim()
        .isLength({ min: 1, max: 5000 })
        .withMessage('Content must be between 1 and 5000 characters'),
    exports.handleValidationErrors
];
// Google auth validation
exports.validateGoogleAuth = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Google token is required'),
    exports.handleValidationErrors
];
// Resend OTP validation
exports.validateResendOTP = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    exports.handleValidationErrors
];
