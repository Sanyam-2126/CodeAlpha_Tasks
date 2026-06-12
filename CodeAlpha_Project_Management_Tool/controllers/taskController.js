const Task = require('../models/Task');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
const User = require('../models/User');

// @desc    Handle task creation post
// @route   POST /tasks
// @access  Private
exports.createTask = async (req, res) => {
  const { title, description, status, priority, dueDate, project, assignedTo } = req.body;

  try {
    if (!title || !project) {
      return res.redirect(`/projects?error=Missing title or project reference`);
    }

    // Verify project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.redirect(`/projects?error=Associated project not found`);
    }

    await Task.create({
      title,
      description,
      status: status || 'To Do',
      priority: priority || 'Medium',
      dueDate: dueDate || null,
      project,
      assignedTo: assignedTo || null,
      owner: req.user._id
    });

    res.redirect(`/projects/${project}?success=Task created successfully`);
  } catch (error) {
    console.error('createTask error:', error.message);
    res.redirect(`/projects/${project}?error=Could not create task`);
  }
};

// @desc    Show detailed view of a task & comments thread
// @route   GET /tasks/:id
// @access  Private
exports.getTaskDetail = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedTo', 'username email')
      .populate('owner', 'username email');

    if (!task) {
      return res.redirect('/projects?error=Task not found');
    }

    const comments = await Comment.find({ task: task._id })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.render('tasks/detail', {
      task,
      comments,
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (error) {
    console.error('getTaskDetail error:', error.message);
    res.redirect('/projects?error=Error loading task details');
  }
};

// @desc    Show task edit page
// @route   GET /tasks/:id/edit
// @access  Private
exports.getEditTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.redirect('/projects?error=Task not found');
    }

    const projects = await Project.find({});
    const users = await User.find({}).select('username email _id');

    res.render('tasks/edit', {
      task,
      projects,
      users,
      error: null
    });
  } catch (error) {
    console.error('getEditTask error:', error.message);
    res.redirect('/projects?error=Error loading task edit page');
  }
};

// @desc    Handle task edit post
// @route   POST /tasks/:id/edit
// @access  Private
exports.updateTask = async (req, res) => {
  const { title, description, status, priority, dueDate, project, assignedTo } = req.body;

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.redirect('/projects?error=Task not found');
    }

    if (!title || !project) {
      const projects = await Project.find({});
      const users = await User.find({});
      return res.render('tasks/edit', {
        task,
        projects,
        users,
        error: 'Title and Project are required fields'
      });
    }

    task.title = title;
    task.description = description;
    task.status = status;
    task.priority = priority;
    task.dueDate = dueDate || null;
    task.project = project;
    task.assignedTo = assignedTo || null;
    
    await task.save();

    res.redirect(`/tasks/${task._id}?success=Task updated successfully`);
  } catch (error) {
    console.error('updateTask error:', error.message);
    res.redirect(`/tasks/${req.params.id}/edit?error=Could not update task`);
  }
};

// @desc    Handle quick inline status update from detail side panel
// @route   POST /tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.redirect('/projects?error=Task not found');
    }

    task.status = status;
    await task.save();

    res.redirect(`/tasks/${task._id}?success=Status updated`);
  } catch (error) {
    console.error('updateTaskStatus error:', error.message);
    res.redirect(`/tasks/${req.params.id}?error=Could not update status`);
  }
};

// @desc    Handle task deletion
// @route   POST /tasks/:id/delete
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.redirect('/projects?error=Task not found');
    }

    const projectId = task.project;

    // Delete associated comments
    await Comment.deleteMany({ task: task._id });

    // Delete task
    await Task.findByIdAndDelete(task._id);

    res.redirect(`/projects/${projectId}?success=Task deleted successfully`);
  } catch (error) {
    console.error('deleteTask error:', error.message);
    res.redirect('/projects?error=Could not delete task');
  }
};
