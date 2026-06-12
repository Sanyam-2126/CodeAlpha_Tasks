// app.js
// Main entry point for our student e-commerce store application.

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware to parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

// Middleware to serve static files (CSS, Images, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Configure EJS as the template view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configure Session middleware with MongoDB store
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secretkey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions'
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // Session lasts for 24 hours
    }
  })
);

// Custom Middleware to pass session data & user info to all EJS templates
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.user = req.session.user || null;
  res.locals.isAdmin = req.session.isAdmin || false;
  res.locals.cartCount = req.session.user && req.session.user.cart ? 
    req.session.user.cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
  next();
});

// Import route modules
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');

// Register routes
app.use(authRoutes);
app.use(shopRoutes);
app.use(adminRoutes);

// 404 Error Handler for routes not matched
app.use((req, res, next) => {
  res.status(404).render('404', { 
    pageTitle: 'Page Not Found',
    path: '/404' 
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
