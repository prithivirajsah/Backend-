const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // React app URL
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage (replace with database in production)
const users = [];
const verificationCodes = new Map();

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Email configuration: prefer custom SMTP (e.g., Brevo), fallback to Gmail
const buildTransport = () => {
  const SMTP_HOST = (process.env.SMTP_HOST || 'smtp-relay.brevo.com').trim();
  const SMTP_PORT = Number((process.env.SMTP_PORT || 587));
  const SMTP_SECURE = String(process.env.SMTP_SECURE || 'false') === 'true';
  const SMTP_USER = (process.env.SMTP_USER || '').trim();
  const SMTP_PASS = (process.env.SMTP_PASS || '').trim();

  const EMAIL_USER = (process.env.EMAIL_USER || '').trim();
  const EMAIL_PASS = (process.env.EMAIL_PASS || '').trim();

  if (SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  if (EMAIL_USER && EMAIL_PASS) {
    const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = String(process.env.SMTP_SECURE || 'true') === 'true';
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });
  }

  // JSON transport as a safe fallback (no real emails sent)
  return nodemailer.createTransport({ jsonTransport: true });
};

const transporter = buildTransport();

// Verify transporter (will succeed for real SMTP, noop for jsonTransport)
transporter.verify((err, success) => {
  if (err) {
    console.error('Nodemailer configuration error:', err.message || err);
  } else {
    const opts = transporter.options || {};
    const host = opts.host || (opts.jsonTransport ? 'jsonTransport' : 'unknown');
    const port = opts.port || '';
    console.log(`Nodemailer ready via ${host}${port ? ':' + port : ''}`);
  }
});

// Helper function to generate verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to send verification email
const sendVerificationEmail = async (email, code) => {
  try {
    const sender = (process.env.SENDER_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER || 'no-reply@example.com').trim();
    const mailOptions = {
      from: sender,
      to: email,
      subject: 'Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Email Verification</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #7c3aed; font-size: 32px; margin: 0;">${code}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend server is running!', status: 'OK' });
});

// Get user info (for testing)
app.get('/api/user', (req, res) => {
  res.json({ 
    message: 'User API endpoint working!',
    users: users.length,
    timestamp: new Date().toISOString()
  });
});

// Register/Sign Up
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    verificationCodes.set(email, {
      code: verificationCode,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification code.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isVerified: newUser.isVerified
      },
      emailSent
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Send verification OTP
app.post('/api/send-verification-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    verificationCodes.set(email, {
      code: verificationCode,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode);

    res.json({
      success: true,
      message: 'Verification code sent successfully',
      emailSent
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Verify email
app.post('/api/verify-email', (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and verification code are required' 
      });
    }

    // Check if verification code exists and is valid
    const storedCode = verificationCodes.get(email);
    if (!storedCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'No verification code found for this email' 
      });
    }

    // Check if code has expired
    if (Date.now() > storedCode.expires) {
      verificationCodes.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: 'Verification code has expired' 
      });
    }

    // Check if code matches
    if (storedCode.code !== code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification code' 
      });
    }

    // Mark user as verified
    const user = users.find(user => user.email === email);
    if (user) {
      user.isVerified = true;
    }

    // Remove verification code
    verificationCodes.delete(email);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Forgot password
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if user exists
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found with this email' 
      });
    }

    // Generate reset code
    const resetCode = generateVerificationCode();
    verificationCodes.set(email, {
      code: resetCode,
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      type: 'password-reset'
    });

    // Send reset email
    const emailSent = await sendVerificationEmail(email, resetCode);

    res.json({
      success: true,
      message: 'Password reset code sent to your email',
      emailSent
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Reset password
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and new password are required' 
      });
    }

    // Check if user exists
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found with this email' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    user.updatedAt = new Date().toISOString();

    // Remove verification code
    verificationCodes.delete(email);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  const emailConfigured = (
    (process.env.SMTP_USER && process.env.SMTP_PASS) ||
    (process.env.EMAIL_USER && process.env.EMAIL_PASS)
  );
  console.log(`📧 Email service: ${emailConfigured ? 'Configured' : 'Not configured (using demo mode)'}`);
  console.log(`🔗 CORS enabled for: http://localhost:3000`);
});