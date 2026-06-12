const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, guest } = require('../middleware/auth');

// Guest pages (redirect to dashboard if already logged in)
router.get('/login', guest, authController.getLogin);
router.post('/login', guest, authController.postLogin);
router.get('/register', guest, authController.getRegister);
router.post('/register', guest, authController.postRegister);

// Private page (destroy session)
router.get('/logout', protect, authController.logout);

module.exports = router;
