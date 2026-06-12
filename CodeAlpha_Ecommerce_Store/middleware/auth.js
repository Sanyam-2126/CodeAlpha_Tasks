// middleware/auth.js
// Middlewares to protect routes based on authentication status and user roles.

// Middleware to check if the user is authenticated (logged in)
exports.isAuth = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }
  next();
};

// Middleware to check if the user is an admin
exports.isAdmin = (req, res, next) => {
  if (!req.session.isLoggedIn || !req.session.isAdmin) {
    return res.status(403).render('403', {
      pageTitle: 'Forbidden',
      path: '/403'
    });
  }
  next();
};
