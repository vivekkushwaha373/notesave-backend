"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.getCurrentUser = exports.googleAuth = exports.loginUser = exports.resendOTP = exports.verifyOTP = exports.registerUser = void 0;
const google_auth_library_1 = require("google-auth-library");
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const email_1 = require("../utils/email");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie = __importStar(require("cookie"));
dotenv_1.default.config();
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Register user with email
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }
        // Generate OTP
        const otp = (0, email_1.generateOTP)();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Create user
        const user = await User_1.default.create({
            name,
            email,
            password,
            otp,
            otpExpires,
            isVerified: false,
            isGoogleUser: false
        });
        // Send OTP email
        await email_1.emailService.sendOTP(email, otp);
        return res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email for verification code.',
            data: {
                userId: user._id,
                email: user.email,
                name: user.name
            }
        });
    }
    catch (error) {
        console.log(error.message || error);
        return res.status(500).json({
            success: false,
            message: 'Failed to register user',
            error: error.message || 'Internal Server Error'
        });
    }
};
exports.registerUser = registerUser;
// Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User_1.default.findOne({
            email,
            otp,
            otpExpires: { $gt: new Date() }
        }).select('+otp +otpExpires');
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }
        // Update user verification status
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        // Generate tokens
        const token = (0, jwt_1.generateToken)(user);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user);
        return res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified
                },
                refreshToken
            }
        });
    }
    catch (error) {
        console.error('Error in verifyOTP:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify OTP',
            error: error.message || 'Internal Server Error'
        });
    }
};
exports.verifyOTP = verifyOTP;
// Resend OTP
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_1.default.findOne({ email, isVerified: false });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found or already verified'
            });
        }
        // Generate new OTP
        const otp = (0, email_1.generateOTP)();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
        // Send OTP email
        await email_1.emailService.sendOTP(email, otp);
        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully'
        });
    }
    catch (error) {
        console.error('Error in resendOTP:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to resend OTP',
            error: error.message || 'Internal Server Error'
        });
    }
};
exports.resendOTP = resendOTP;
// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user and include password
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Check if user is verified
        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email first'
            });
        }
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Generate tokens
        const token = (0, jwt_1.generateToken)(user);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user);
        const cookieString = cookie.serialize('token', token, {
            sameSite: 'none',
            secure: true,
            httpOnly: true,
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            path: '/'
        });
        res.setHeader('Set-Cookie', cookieString);
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified
                },
                refreshToken
            }
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message || 'Internal Server Error'
        });
    }
};
exports.loginUser = loginUser;
// Google OAuth login
const googleAuth = async (req, res) => {
    const { code } = req.body;
    try {
        console.log('I Entered in googleAuth function');
        // 1. Exchange code for tokens
        const tokenResponse = await axios_1.default.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: `${process.env.FRONTEND_URL}/auth/callback`,
            grant_type: 'authorization_code',
        }, { headers: { 'Content-Type': 'application/json' } });
        const { id_token, access_token } = tokenResponse.data;
        // 2. Decode ID token to get user info
        const ticket = await googleClient.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).json({ success: false, message: 'Invalid token' });
        }
        const { sub: googleId, email, name, email_verified } = payload;
        if (!email_verified) {
            return res.status(400).json({ success: false, message: 'Email not verified' });
        }
        // 3. User logic (same as your code)
        let user = await User_1.default.findOne({ email });
        if (user) {
            if (!user.isGoogleUser) {
                user.isGoogleUser = true;
                user.googleId = googleId;
                user.isVerified = true;
                await user.save();
            }
        }
        else {
            user = await User_1.default.create({
                name: name || 'Google User',
                email,
                googleId,
                isGoogleUser: true,
                isVerified: true
            });
        }
        // 4. Generate tokens and set cookie
        const tokenjwt = (0, jwt_1.generateToken)(user);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user);
        res.cookie('token', tokenjwt, {
            sameSite: 'none',
            secure: true,
            httpOnly: true,
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 1 day
        });
        return res.status(200).json({
            success: true,
            message: 'Google auth successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified,
                },
                refreshToken
            }
        });
    }
    catch (err) {
        console.error('OAuth error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Google login failed',
        });
    }
};
exports.googleAuth = googleAuth;
// Get current user
const getCurrentUser = async (req, res) => {
    try {
        const user = req.user;
        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified,
                    isGoogleUser: user.isGoogleUser
                }
            }
        });
    }
    catch (error) {
        console.log(error || error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to get current user',
            error: error.message || 'Internal Server Error'
        });
    }
};
exports.getCurrentUser = getCurrentUser;
// Logout user (optional - mainly for clearing client-side tokens)
const logoutUser = async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
    });
    return res.status(200).json({
        success: true,
        message: 'Logout successful'
    });
};
exports.logoutUser = logoutUser;
