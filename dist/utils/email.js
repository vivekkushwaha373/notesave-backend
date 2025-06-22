"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = exports.emailService = void 0;
// src/utils/email.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    async sendEmail(options) {
        const mailOptions = {
            from: `"Notes App" <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };
        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Email sent successfully to ${options.to}`);
        }
        catch (error) {
            console.error('Email sending failed:', error);
            throw new Error('Failed to send email');
        }
    }
    async sendOTP(email, otp) {
        const subject = 'Verify your email - Notes App';
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .otp { font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; margin: 20px 0; letter-spacing: 8px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Notes App</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hello!</p>
            <p>Thank you for signing up with Notes App. To complete your registration, please use the following OTP:</p>
            <div class="otp">${otp}</div>
            <p>This OTP will expire in 10 minutes for security reasons.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Notes App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        await this.sendEmail({ to: email, subject, html });
    }
}
exports.emailService = new EmailService();
// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateOTP = generateOTP;
