const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Show user home dashboard with metrics cards and upcoming tasks
// @route   GET /dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
  try {
    // Count stats from db
    const totalProjects = await Project.countDocuments();
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const pendingTasks = await Task.countDocuments({ status: { $ne: 'Completed' } });

    // Fetch up to 5 upcoming pending tasks, ordered by closest due date
    const upcomingTasks = await Task.find({ status: { $ne: 'Completed' } })
      .populate('project', 'name')
      .populate('assignedTo', 'username')
      .sort({ dueDate: 1 }) // Closest due dates first
      .limit(5);

    res.render('dashboard', {
      stats: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks
      },
      upcomingTasks,
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (error) {
    console.error('getDashboard error:', error.message);
    res.render('dashboard', {
      stats: { totalProjects: 0, totalTasks: 0, completedTasks: 0, pendingTasks: 0 },
      upcomingTasks: [],
      error: 'Error loading dashboard metrics',
      success: null
    });
  }
};
