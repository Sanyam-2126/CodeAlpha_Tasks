const User = require('../models/User');

// @desc    Show login page
// @route   GET /auth/login
// @access  Public (Guest)
exports.getLogin = (req, res) => {
  res.render('login', {
    error: req.query.error || null,
    success: req.query.success || null
  });
};

// @desc    Handle login post
// @route   POST /auth/login
// @access  Public (Guest)
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !password) {
      return res.render('login', { error: 'Please enter all fields', success: null });
    }

    // Check user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.render('login', { error: 'Invalid email or password', success: null });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid email or password', success: null });
    }

    // Set session
    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login Error:', error.message);
    res.render('login', { error: 'Server error. Please try again.', success: null });
  }
};

// @desc    Show registration page
// @route   GET /auth/register
// @access  Public (Guest)
exports.getRegister = (req, res) => {
  res.render('register', { error: null });
};

// @desc    Handle registration post
// @route   POST /auth/register
// @access  Public (Guest)
exports.postRegister = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Validation
    if (!username || !email || !password) {
      return res.render('register', { error: 'Please fill in all fields' });
    }

    if (password.length < 6) {
      return res.render('register', { error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.render('register', { error: 'Username or Email is already registered' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    // Automatically set session (Login)
    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.render('register', { error: 'Server error during registration. Try again.' });
  }
};

// @desc    Log user out & destroy session
// @route   GET /auth/logout
// @access  Private
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout Session Destroy Error:', err);
    }
    res.redirect('/auth/login?success=Logged out successfully');
  });
};
