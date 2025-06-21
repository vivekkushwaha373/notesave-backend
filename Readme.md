# Notes App Backend

A full-stack note-taking application backend built with Node.js, TypeScript, Express, and MongoDB.

## Features

- **Authentication System**
  - Email/Password registration with OTP verification
  - Google OAuth 2.0 integration
  - JWT-based authentication
  - Password hashing with bcrypt

- **Notes Management**
  - Create, read, update, delete notes
  - Search functionality
  - Pagination support
  - User-specific notes isolation

- **Security**
  - Input validation and sanitization
  - CORS configuration
  - Rate limiting ready
  - Security headers

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Google OAuth 2.0
- **Email**: Nodemailer
- **Validation**: express-validator

## Prerequisites

Before running this application, make sure you have:

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Gmail account for email services (or other SMTP provider)
- Google Cloud Console project for OAuth

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notes-app-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` file with your actual values:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/notes-app

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d

   # Server
   PORT=5000
   NODE_ENV=development

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins: `http://localhost:3000`
6. Add authorized redirect URIs: `http://localhost:3000`
7. Copy Client ID and Client Secret to `.env`

## Gmail Setup for Email

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this app password in `EMAIL_PASS`

## Development

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Build for production**
   ```bash
   npm run build
   ```

3. **Start production server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Notes
- `GET /api/notes` - Get user notes (paginated)
- `GET /api/notes/search?q=query` - Search notes
- `GET /api/notes/stats` - Get notes statistics
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `DELETE /api/notes` - Delete multiple notes

### Health Check
- `GET /health` - Server health status

## Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

### Create Note
```bash
POST /api/notes
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "My First Note",
  "content": "This is the content of my note"
}
```

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if any
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS protection
- Security headers (XSS, CSRF protection)
- MongoDB injection prevention

## Database Schema

### User Model
```typescript
{
  name: string;
  email: string;
  password?: string;
  isGoogleUser: boolean;
  googleId?: string;
  isVerified: boolean;
  otp?: string;
  otpExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Note Model
```typescript
{
  title: string;
  content: string;
  user: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

## Deployment

### Prerequisites for Deployment
- MongoDB Atlas account (for cloud database)
- Email service provider
- Cloud hosting service (Heroku, Railway, etc.)

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use MongoDB Atlas connection string
- Use production-grade JWT secret
- Configure proper CORS origins
- Set up proper email service

### Deployment Steps
1. Build the application: `npm run build`
2. Set environment variables in your hosting platform
3. Deploy the `dist` folder and `package.json`
4. Run `npm install --production` on the server
5. Start with `npm start`

## Development Guidelines

1. **Code Structure**
   - Controllers handle request/response logic
   - Models define database schemas
   - Middleware handles authentication, validation, errors
   - Utils contain helper functions
   - Routes define API endpoints

2. **Error Handling**
   - Use `asyncHandler` wrapper for async functions
   - Throw `CustomError` for operational errors
   - Global error handler catches all errors

3. **Validation**
   - Use express-validator for input validation
   - Validate all user inputs
   - Sanitize data before database operations

4. **Security**
   - Never expose sensitive data in responses
   - Use environment variables for secrets
   - Implement proper authentication checks

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB is running
   - Verify connection string
   - Check network connectivity for Atlas

2. **Email Not Sending**
   - Verify Gmail app password
   - Check email configuration
   - Ensure 2FA is enabled on Gmail

3. **Google OAuth Issues**
   - Verify client ID and secret
   - Check authorized origins
   - Ensure Google+ API is enabled

4. **JWT Errors**
   - Check JWT_SECRET is set
   - Verify token format
   - Check token expiration

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## License

This project is licensed under the MIT License.