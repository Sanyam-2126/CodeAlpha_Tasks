const Comment = require('../models/Comment');
const Task = require('../models/Task');

// @desc    Handle comment creation
// @route   POST /comments
// @access  Private
exports.createComment = async (req, res) => {
  const { content, task } = req.body;

  try {
    if (!content || !task) {
      return res.redirect('/projects?error=Comment content and task reference are required');
    }

    // Verify task exists
    const taskExists = await Task.findById(task);
    if (!taskExists) {
      return res.redirect('/projects?error=Associated task not found');
    }

    await Comment.create({
      content,
      task,
      user: req.user._id
    });

    res.redirect(`/tasks/${task}?success=Comment posted successfully`);
  } catch (error) {
    console.error('createComment error:', error.message);
    res.redirect(`/tasks/${task}?error=Could not post comment`);
  }
};
