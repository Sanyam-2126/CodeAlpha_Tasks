const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Set View Engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Configure Express Session
app.use(
  session({
    secret: process.env.JWT_SECRET || 'student_internship_jwt_secret_key_123456',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // Session valid for 1 day
    }
  })
);

// Mount routers
app.use('/auth', require('./routes/auth'));
app.use('/projects', require('./routes/projects'));
app.use('/tasks', require('./routes/tasks'));
app.use('/comments', require('./routes/comments'));
app.use('/dashboard', require('./routes/dashboard'));

// Root path redirect to dashboard
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Fallback error view for 404 routes
app.use((req, res) => {
  res.status(404).render('login', {
    error: '404 - Page not found',
    success: null
  });
});

// Port configuration
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});
