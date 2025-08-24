# Backend API

A robust Node.js backend API built with Express.js and MongoDB for a application. This API provides comprehensive user authentication, email verification, password management, and user profile functionality with secure JWT-based authentication.

## ✨ Features

- **🔐 User Authentication**: Secure registration, login, and logout with JWT tokens
- **📧 Email Verification**: OTP-based email verification system (24-hour expiry)
- **🔑 Password Reset**: Secure password reset via OTP (15-minute expiry)
- **🛡️ JWT Security**: Stateless authentication with HTTP-only secure cookies
- **📨 Email Notifications**: Welcome emails and OTP delivery via Brevo SMTP
- **🗄️ MongoDB Integration**: Scalable database with Mongoose ODM
- **🔒 Security Features**: Password hashing with bcrypt, CORS protection
- **✅ Input Validation**: Comprehensive request validation and error handling
- **🌐 CORS Ready**: Configured for frontend integration

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt (10 salt rounds)
- **Email Service**: Nodemailer with Brevo SMTP
- **Middleware**: CORS, Cookie Parser
- **Environment**: dotenv for configuration

## 📁 Project Structure

```
Backend/
├── config/
│   ├── mongodb.js          # MongoDB connection with event handlers
│   └── nodemailer.js       # Brevo SMTP email configuration
├── controllers/
│   ├── authController.js    # Complete authentication logic
│   └── userController.js    # User profile management
├── middleware/
│   └── userAuth.js         # JWT authentication middleware
├── models/
│   └── usermodel.js        # User schema with OTP fields
├── routes/
│   ├── authRoutes.js       # Authentication endpoints
│   └── userRoutes.js       # User management endpoints
├── server.js               # Main server with error handling
└── package.json            # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Brevo SMTP account (or configure your own email service)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=4000
   MONGODB_URL=mongodb://localhost:27017
   JWT_SECRET=your_jwt_secret_key_here
   SENDER_EMAIL=your_email@gmail.com
   EMAIL_PASSWORD=your_email_app_password
   SMTP_USER=your_brevo_smtp_username
   SMTP_PASS=your_brevo_smtp_password
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development mode with nodemon (auto-restart)
   npm run server
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:4000`

## 📡 API Endpoints

### 🔐 Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required | Request Body |
|--------|----------|-------------|---------------|--------------|
| POST | `/register` | User registration | No | `{name, email, password}` |
| POST | `/login` | User login | No | `{email, password}` |
| POST | `/logout` | User logout | No | `{}` |
| POST | `/send-verify-otp` | Send email verification OTP | Yes | `{userID}` |
| POST | `/verify-account` | Verify email with OTP | Yes | `{userID, otp}` |
| POST | `/is-auth` | Check authentication status | Yes | `{}` |
| POST | `/send-reset-otp` | Send password reset OTP | No | `{email}` |
| POST | `/reset-password` | Reset password with OTP | No | `{email, otp, newPassword}` |

### 👤 User Routes (`/api/user`)

| Method | Endpoint | Description | Auth Required | Request Body |
|--------|----------|-------------|---------------|--------------|
| GET | `/data` | Get user profile data | Yes | `{userID}` |

## 🔐 Authentication Implementation

### JWT Token Details
- **Algorithm**: HMAC SHA256
- **Expiry**: 7 days
- **Storage**: HTTP-only secure cookies
- **Security**: Production-ready with secure flags

### Cookie Configuration
```javascript
res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

### Protected Routes
Routes requiring authentication use the `userAuth` middleware:
- Extracts JWT from cookies
- Verifies token validity
- Attaches `userID` to `req.body` for controllers
- Returns 401 for invalid/expired tokens

## 📧 Email System

### Email Features
- **Welcome Emails**: Automatic upon user registration
- **Verification OTP**: 6-digit OTP for email verification
- **Password Reset OTP**: 6-digit OTP for password reset
- **SMTP Provider**: Brevo (formerly Sendinblue)

### Email Templates
```javascript
// Welcome Email
subject: 'Welcome to ........'
text: `Welcome to ......... Website. 
Your account has been created with email ID: ${email}`

// Verification OTP
subject: 'Account Verification OTP'
text: `Your OTP is ${otp}. Verify your Account using this OTP.`

// Password Reset OTP
subject: 'Password Reset OTP'
text: `Your OTP for resetting your password is ${otp}.
Use this OTP to proceed with resetting your password.`
```

### OTP Expiry Times
- **Email Verification**: 24 hours
- **Password Reset**: 15 minutes

## 🗄️ Database Schema

### User Model (`usermodel.js`)
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, hashed },
  verifyOtp: { type: String, default: '' },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: '' },
  resetOtpExpireAt: { type: Number, default: 0 }
}
```

### Database Connection
- **Database Name**: `mern-auth`
- **Connection Events**: Connected, Error, Disconnected
- **Error Handling**: Graceful fallback with process exit

## 🔒 Security Features

### Password Security
- **Hashing**: bcrypt with 10 salt rounds
- **Comparison**: Secure password verification
- **Reset**: Secure OTP-based password reset

### JWT Security
- **Secret Key**: Environment variable based
- **Token Validation**: Comprehensive error handling
- **Cookie Security**: HTTP-only, secure flags

### CORS Configuration
```javascript
cors({
    origin: "http://localhost:3000", 
    credentials: true
})
```

## 🚨 Error Handling

### Comprehensive Error Management
- **JSON Parsing**: Graceful handling of malformed JSON
- **Database Errors**: Connection and query error handling
- **Authentication Errors**: Token validation and expiry
- **Validation Errors**: Missing required fields
- **General Errors**: 500 status with error logging

### Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

## 🔧 Configuration Files

### MongoDB Configuration (`config/mongodb.js`)
- Event-driven connection monitoring
- Automatic reconnection handling
- Environment-based connection string

### Nodemailer Configuration (`config/nodemailer.js`)
- Brevo SMTP configuration
- Transport verification
- Error logging for email setup

## 🚀 Development

### Available Scripts
```bash
npm start          # Start production server
npm run server     # Start development server with nodemon
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port number | No | 4000 |
| `MONGODB_URL` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT signing | Yes | - |
| `SENDER_EMAIL` | Email address for sending emails | Yes | - |
| `EMAIL_PASSWORD` | Email service password | Yes | - |
| `SMTP_USER` | Brevo SMTP username | Yes | - |
| `SMTP_PASS` | Brevo SMTP password | Yes | - |
| `NODE_ENV` | Environment (development/production) | No | development |

## 🌐 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful"
}
```

### User Data Response
```json
{
  "success": true,
  "userData": {
    "name": "User Name",
    "email": "user@example.com",
    "isAccountVerified": true
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## 📝 Code Implementation Details

### Authentication Flow
1. **Registration**: Hash password, create user, send welcome email, set JWT cookie
2. **Login**: Verify credentials, set JWT cookie
3. **Logout**: Clear JWT cookie
4. **Verification**: Generate OTP, send email, verify OTP, update user status
5. **Password Reset**: Generate OTP, send email, verify OTP, hash new password

### Middleware Chain
1. **userAuth**: JWT extraction and validation
2. **Controller**: Business logic execution
3. **Response**: JSON response with appropriate status

### Database Operations
- **User Creation**: New user with hashed password
- **User Lookup**: Email-based user finding
- **OTP Management**: Generation, storage, and expiry
- **Status Updates**: Verification and password reset

## 🔧 Customization Options

### Email Configuration
- **SMTP Provider**: Change from Brevo to any SMTP service
- **Email Templates**: Modify content in `authController.js`
- **OTP Expiry**: Adjust timing in OTP generation functions

### Security Settings
- **JWT Expiry**: Modify token expiration time
- **Password Policy**: Add password strength requirements
- **CORS Origins**: Update allowed frontend origins

### Database Configuration
- **Database Name**: Change from `mern-auth` to your preferred name
- **Connection Options**: Add MongoDB connection options
- **Schema Modifications**: Extend user model with additional fields

## 📚 Dependencies

### Core Dependencies
- **express**: Web framework for API endpoints
- **mongoose**: MongoDB ODM for database operations
- **jsonwebtoken**: JWT implementation for authentication
- **bcrypt**: Password hashing and verification
- **nodemailer**: Email service integration
- **cors**: Cross-origin resource sharing
- **cookie-parser**: Cookie parsing middleware
- **dotenv**: Environment variable management

### Development Dependencies
- **nodemon**: Auto-restart server during development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support & Troubleshooting

### Common Issues
- **Connection Refused**: Ensure MongoDB is running and accessible
- **Email Not Sending**: Verify SMTP credentials and Brevo account
- **JWT Errors**: Check JWT_SECRET environment variable
- **CORS Issues**: Verify frontend origin matches CORS configuration

### Getting Help
- Open an issue in the repository
- Check MongoDB connection status
- Verify environment variables
- Review email service configuration

---

**⚠️ Important Notes:**
- Never commit `.env` files to version control
- Keep JWT_SECRET secure and unique
- Regularly update dependencies for security
- Monitor MongoDB connection status in production
- Test email functionality before deployment

**🚀 Ready to deploy!** Your ........ Backend API is production-ready with comprehensive authentication, email verification, and security features.
