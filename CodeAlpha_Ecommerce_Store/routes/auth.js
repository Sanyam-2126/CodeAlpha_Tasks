// routes/auth.js
// Handles authentication routes like Login, Registration, and Logout.

const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// GET: Render Login Page
router.get('/login', (req, res) => {
  // If already logged in, redirect to home page
  if (req.session.isLoggedIn) {
    return res.redirect('/');
  }
  res.render('login', {
    pageTitle: 'Login',
    path: '/login',
    errorMessage: null // Initialize error message as null
  });
});

// POST: Handle Login Form Submission
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Search for user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(422).render('login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: 'Invalid email or password.'
      });
    }

    // 2. Compare entered password with hashed password in DB
    const doMatch = await bcrypt.compare(password, user.password);
    if (doMatch) {
      // Set session variables
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.isAdmin = user.isAdmin;

      // Save session explicitly to ensure redirect happens after write is complete
      return req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
        }
        res.redirect('/');
      });
    }

    // Passwords do not match
    return res.status(422).render('login', {
      pageTitle: 'Login',
      path: '/login',
      errorMessage: 'Invalid email or password.'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('500', {
      pageTitle: 'Server Error',
      path: '/500'
    });
  }
});

// GET: Render Registration Page
router.get('/register', (req, res) => {
  if (req.session.isLoggedIn) {
    return res.redirect('/');
  }
  res.render('register', {
    pageTitle: 'Register',
    path: '/register',
    errorMessage: null
  });
});

// POST: Handle Registration Form Submission
router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Simple input validation
  if (!name || !email || !password || !confirmPassword) {
    return res.status(422).render('register', {
      pageTitle: 'Register',
      path: '/register',
      errorMessage: 'All fields are required.'
    });
  }

  if (password !== confirmPassword) {
    return res.status(422).render('register', {
      pageTitle: 'Register',
      path: '/register',
      errorMessage: 'Passwords do not match.'
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(422).render('register', {
        pageTitle: 'Register',
        path: '/register',
        errorMessage: 'Email already registered. Try logging in.'
      });
    }

    // Hash the password with bcrypt (12 rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create and save new user
    const user = new User({
      name: name,
      email: email.toLowerCase(),
      password: hashedPassword,
      cart: { items: [] }
    });

    await user.save();
    console.log(`New user registered: ${user.email}`);

    // Redirect to login page after successful registration
    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).render('500', {
      pageTitle: 'Server Error',
      path: '/500'
    });
  }
});

// POST: Handle Session Logout
router.post('/logout', (req, res) => {
  // Destroy the user session in the store
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;
