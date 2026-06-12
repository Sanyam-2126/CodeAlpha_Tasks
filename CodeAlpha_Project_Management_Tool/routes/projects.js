const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

// All project routes require logging in
router.use(protect);

router.get('/', projectController.getProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProjectDetail);
router.get('/:id/edit', projectController.getEditProject);
router.post('/:id/edit', projectController.updateProject);
router.post('/:id/delete', projectController.deleteProject);

module.exports = router;
