const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.post('/', protect, commentController.createComment);

module.exports = router;
