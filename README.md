# Backend API - User Authentication System

A robust Node.js backend API built with Express.js and MongoDB for user authentication and management. This API provides secure user registration, login, email verification, password reset functionality, and user profile management.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Email Verification**: OTP-based email verification system
- **Password Reset**: Secure password reset via OTP
- **JWT Authentication**: Stateless authentication with secure cookies
- **Email Notifications**: Welcome emails and OTP delivery via Nodemailer
- **MongoDB Integration**: Scalable database with Mongoose ODM
- **Security Features**: Password hashing with bcrypt, CORS protection
- **Input Validation**: Request validation and error handling

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Email Service**: Nodemailer
- **Middleware**: CORS, Cookie Parser
- **Environment**: dotenv for configuration

## 📁 Project Structure

```
Backend/
├── config/
│   ├── mongodb.js          # Database connection
│   └── nodemailer.js       # Email configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── userController.js    # User management logic
├── middleware/
│   └── userAuth.js         # JWT authentication middleware
├── models/
│   └── usermodel.js        # User schema and model
├── routes/
│   ├── authRoutes.js       # Authentication endpoints
│   └── userRoutes.js       # User management endpoints
├── server.js               # Main server file
└── package.json            # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Email service credentials (Gmail, SendGrid, etc.)

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
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development mode with nodemon
   npm run server
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:4000`

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | User registration | No |
| POST | `/login` | User login | No |
| POST | `/logout` | User logout | No |
| POST | `/send-verify-otp` | Send email verification OTP | Yes |
| POST | `/verify-account` | Verify email with OTP | Yes |
| POST | `/is-auth` | Check authentication status | Yes |
| POST | `/send-reset-otp` | Send password reset OTP | No |
| POST | `/reset-password` | Reset password with OTP | No |

### User Routes (`/api/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/data` | Get user profile data | Yes |

## 🔐 Authentication

The API uses JWT tokens stored in HTTP-only cookies for security:

- **Token Expiry**: 7 days
- **Storage**: Secure HTTP-only cookies
- **Middleware**: `userAuth` middleware for protected routes

### Protected Routes
Routes requiring authentication use the `userAuth` middleware to verify JWT tokens.

## 📧 Email Features

- **Welcome Emails**: Sent automatically upon user registration
- **OTP Delivery**: Email verification and password reset OTPs
- **Configurable**: Supports various email providers via Nodemailer

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  verifyOtp: String,
  verifyOtpExpireAt: Number,
  isAccountVerified: Boolean (default: false),
  resetOtp: String,
  resetOtpExpireAt: Number
}
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Security**: Secure token storage in HTTP-only cookies
- **CORS Protection**: Configured for frontend integration
- **Input Validation**: Request body validation
- **Error Handling**: Graceful error responses

## 🚀 Development

### Available Scripts

```bash
npm start          # Start production server
npm run server     # Start development server with nodemon
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | No (default: 4000) |
| `MONGODB_URL` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `SENDER_EMAIL` | Email address for sending emails | Yes |
| `EMAIL_PASSWORD` | Email service password/app password | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## 🌐 CORS Configuration

The API is configured to accept requests from `http://localhost:3000` (typical React frontend) with credentials enabled.

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## 🔧 Customization

- **Email Templates**: Modify email content in `authController.js`
- **Token Expiry**: Adjust JWT expiration in authentication functions
- **Password Policy**: Modify password requirements in validation
- **CORS Origins**: Update allowed origins in `server.js`

## 🚨 Error Handling

The API includes comprehensive error handling:
- JSON parsing errors
- Database connection issues
- Authentication failures
- Validation errors

## 📚 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT implementation
- **bcrypt**: Password hashing
- **nodemailer**: Email service
- **cors**: Cross-origin resource sharing
- **cookie-parser**: Cookie parsing middleware
- **dotenv**: Environment variable management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Note**: Make sure to keep your `.env` file secure and never commit sensitive information like API keys or passwords to version control.
