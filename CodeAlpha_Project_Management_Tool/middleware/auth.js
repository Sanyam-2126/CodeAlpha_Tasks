const User = require('../models/User');

// Middleware to protect routes that require authentication
const protect = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      // Session has invalid user ID
      return req.session.destroy(() => {
        res.redirect('/auth/login');
      });
    }

    req.user = user;
    res.locals.user = user; // Makes user profile info globally accessible in all EJS templates
    next();
  } catch (error) {
    console.error('Session auth error:', error.message);
    res.redirect('/auth/login');
  }
};

// Middleware to redirect logged-in users away from auth pages (login/signup)
const guest = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
};

module.exports = { protect, guest };
