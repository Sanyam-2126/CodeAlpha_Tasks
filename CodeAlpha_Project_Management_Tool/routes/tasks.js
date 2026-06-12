const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// All task routes require logging in
router.use(protect);

router.post('/', taskController.createTask);
router.get('/:id', taskController.getTaskDetail);
router.get('/:id/edit', taskController.getEditTask);
router.post('/:id/edit', taskController.updateTask);
router.post('/:id/status', taskController.updateTaskStatus);
router.post('/:id/delete', taskController.deleteTask);

module.exports = router;
