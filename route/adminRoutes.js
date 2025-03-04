const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../model/admin');
const cors = require('cors');

const router = express.Router();

const corsOptions = {
    origin: 'http://localhost:3000',  // Correct origin (React app's URL)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Encrypted-Data'],
    credentials: true,  // Allow cookies and credentials to be sent
  };
  
  router.use(cors(corsOptions)); // Apply CORS middleware
  
  router.options('*', cors(corsOptions)); // Handle preflight requests

// Directly set the JWT secret key here (not recommended for production)
const JWT_SECRET = 'your_secure_jwt_secret_key'; // Make sure to change this key and store it securely

// Login route with password hashing
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: 'false', message: 'Username and password are required' });
  }

  try {
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.json({
        status: 'false',
        message: "Couldn't find the user",
      });
    }

   
    if (!password==admin.password) {
      return res.json({
        status: 'false',
        message: 'Wrong password',
      });
    }

    // Create JWT token with user info
    const token = jwt.sign(
  { userId: admin._id, username: admin.username, role: admin.role },
  JWT_SECRET,
  { expiresIn: '7d' }  // Set the JWT token to expire in 7 days
);

// Set JWT token in cookie (with security flags)
res.cookie('auth_token', token, {
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days expiration (in milliseconds)
  sameSite: 'Strict',  // Mitigate CSRF attacks
});

    // Send the token in the response as well (if needed on frontend)
    res.status(200).json({
      status: 'true',
      message: 'Login successful',
      token: token,  // You might want to send the token in the body for client-side use
    });
  } catch (err) {
    res.status(500).json({
      status: 'false',
      message: 'Error during login',
      error: 'Internal server error',
    });
  }
});

// Token verification route
router.get('/verify-token', (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ status: 'false', message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify token and decode
    res.status(200).json({
      status: 'true',
      message: 'Token is valid',
      payload: decoded, // Return the decoded payload (user info)
    });
  } catch (err) {
    res.status(400).json({
      status: 'false',
      message: 'Invalid token',
      error: err.message,
    });
  }
});

module.exports = router;
