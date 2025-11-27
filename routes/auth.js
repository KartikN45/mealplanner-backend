const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Signup
router.post('/signup', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Signup request received:`, req.body);
  const { firstName, lastName, email, password } = req.body;

  try {
    // Validate input
    if (!firstName || !lastName || !email || !password) {
      console.log(`[${new Date().toISOString()}] Validation failed: Missing fields`, req.body);
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!isValidEmail(email)) {
      console.log(`[${new Date().toISOString()}] Validation failed: Invalid email format`, email);
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      console.log(`[${new Date().toISOString()}] Validation failed: Password too short`, email);
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log(`[${new Date().toISOString()}] MongoDB not connected`);
      return res.status(500).json({ message: 'Database not connected' });
    }

    console.log(`[${new Date().toISOString()}] Checking for existing user with email: ${email}`);
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`[${new Date().toISOString()}] Validation failed: Email already exists`, email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    console.log(`[${new Date().toISOString()}] Creating new user:`, { firstName, lastName, email });
    const user = new User({ firstName, lastName, email, password });
    await user.save();

    console.log(`[${new Date().toISOString()}] User saved successfully:`, { firstName, lastName, email });
    res.status(201).json({ message: 'Signup successful', user });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Signup error: ${err.message}\n${err.stack}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Login request received:`, req.body);
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      console.log(`[${new Date().toISOString()}] Validation failed: Missing fields`);
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!isValidEmail(email)) {
      console.log(`[${new Date().toISOString()}] Validation failed: Invalid email format`, email);
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log(`[${new Date().toISOString()}] MongoDB not connected`);
      return res.status(500).json({ message: 'Database not connected' });
    }

    console.log(`[${new Date().toISOString()}] Checking user credentials for email: ${email}`);
    const user = await User.findOne({ email, password });

    if (!user) {
      console.log(`[${new Date().toISOString()}] Validation failed: Invalid credentials`, email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log(`[${new Date().toISOString()}] User logged in:`, { email });
    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Login error: ${err.message}\n${err.stack}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
