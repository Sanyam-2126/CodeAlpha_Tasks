const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const User = require('../models/User');

// @desc    Get all projects
// @route   GET /projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('owner', 'username email');
    res.render('projects/index', {
      projects,
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (error) {
    console.error('getProjects error:', error.message);
    res.redirect('/dashboard?error=Error fetching projects');
  }
};

// @desc    Get single project details (Kanban Board)
// @route   GET /projects/:id
// @access  Private
exports.getProjectDetail = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner', 'username email');
    if (!project) {
      return res.redirect('/projects?error=Project not found');
    }

    // Capture filters and search query
    const { search, priority } = req.query;
    
    // Filter tasks by project
    const taskQuery = { project: project._id };

    // Apply priority filter
    if (priority) {
      taskQuery.priority = priority;
    }

    // Apply search filter (title case-insensitive regex)
    if (search) {
      taskQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(taskQuery)
      .populate('assignedTo', 'username email')
      .populate('owner', 'username email')
      .sort({ createdAt: -1 });

    // Separate tasks into Kanban lists
    const todoTasks = tasks.filter(task => task.status === 'To Do');
    const progressTasks = tasks.filter(task => task.status === 'In Progress');
    const completedTasks = tasks.filter(task => task.status === 'Completed');

    // Fetch all users to populate assignee select dropdown
    const users = await User.find({}).select('username email _id');

    res.render('projects/detail', {
      project,
      todoTasks,
      progressTasks,
      completedTasks,
      users,
      filters: { search: search || '', priority: priority || '' },
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (error) {
    console.error('getProjectDetail error:', error.message);
    res.redirect('/projects?error=Error loading board');
  }
};

// @desc    Create project form action
// @route   POST /projects
// @access  Private
exports.createProject = async (req, res) => {
  const { name, description } = req.body;

  try {
    if (!name) {
      return res.redirect('/projects?error=Project name is required');
    }

    await Project.create({
      name,
      description,
      owner: req.user._id
    });

    res.redirect('/projects?success=Project created successfully');
  } catch (error) {
    console.error('createProject error:', error.message);
    res.redirect('/projects?error=Could not create project');
  }
};

// @desc    Show project edit page
// @route   GET /projects/:id/edit
// @access  Private
exports.getEditProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.redirect('/projects?error=Project not found');
    }

    // Ownership verification
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.redirect(`/projects?error=Not authorized. Only the project owner can edit.`);
    }

    res.render('projects/edit', { project, error: null });
  } catch (error) {
    console.error('getEditProject error:', error.message);
    res.redirect('/projects?error=Error loading edit page');
  }
};

// @desc    Handle project edit post
// @route   POST /projects/:id/edit
// @access  Private
exports.updateProject = async (req, res) => {
  const { name, description } = req.body;

  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.redirect('/projects?error=Project not found');
    }

    // Ownership verification
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.redirect(`/projects?error=Not authorized. Only the project owner can edit.`);
    }

    if (!name) {
      return res.render('projects/edit', { project, error: 'Project name is required' });
    }

    project.name = name;
    project.description = description;
    await project.save();

    res.redirect(`/projects/${project._id}?success=Project updated successfully`);
  } catch (error) {
    console.error('updateProject error:', error.message);
    res.redirect('/projects?error=Could not update project');
  }
};

// @desc    Handle project deletion
// @route   POST /projects/:id/delete
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.redirect('/projects?error=Project not found');
    }

    // Ownership verification
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.redirect('/projects?error=Not authorized. Only the project owner can delete.');
    }

    // Find all tasks of this project to delete comments
    const tasks = await Task.find({ project: project._id });
    const taskIds = tasks.map(task => task._id);

    // Delete comments
    await Comment.deleteMany({ task: { $in: taskIds } });

    // Delete tasks
    await Task.deleteMany({ project: project._id });

    // Delete project
    await Project.findByIdAndDelete(project._id);

    res.redirect('/projects?success=Project and associated tasks/comments deleted');
  } catch (error) {
    console.error('deleteProject error:', error.message);
    res.redirect('/projects?error=Could not delete project');
  }
};
