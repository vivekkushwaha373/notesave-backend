"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.ts
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', validation_1.validateUserRegistration, authController_1.registerUser);
router.post('/verify-otp', validation_1.validateOTP, authController_1.verifyOTP);
router.post('/resend-otp', validation_1.validateResendOTP, authController_1.resendOTP);
router.post('/login', validation_1.validateUserLogin, authController_1.loginUser);
router.post('/google', authController_1.googleAuth);
// Protected routes
router.get('/me', auth_1.authenticateToken, authController_1.getCurrentUser);
router.post('/logout', auth_1.authenticateToken, authController_1.logoutUser);
exports.default = router;
