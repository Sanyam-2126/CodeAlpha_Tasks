const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Load models
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Comment = require('./models/Comment');

const seedData = async () => {
  try {
    // Connect to database
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/project_manager');
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Comment.deleteMany({});
    console.log('Collections cleared.');

    // 1. Create Users
    console.log('Creating users...');
    const user1 = await User.create({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123'
    });

    const user2 = await User.create({
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123'
    });

    const user3 = await User.create({
      username: 'charlie',
      email: 'charlie@example.com',
      password: 'password123'
    });

    console.log('Users created successfully: alice, bob, charlie (Password for all: password123)');

    // 2. Create Projects
    console.log('Creating projects...');
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Revamping the company website to a modern, responsive single page layout.',
      owner: user1._id
    });

    const project2 = await Project.create({
      name: 'Mobile App Launch',
      description: 'Prepare the new iOS and Android mobile apps for deployment to App Stores.',
      owner: user2._id
    });

    console.log('Projects created successfully.');

    // 3. Create Tasks
    console.log('Creating tasks...');
    const today = new Date();
    
    // Website Redesign Tasks
    const task1 = await Task.create({
      title: 'Design Wireframes',
      description: 'Sketch layout and create Figma mockups for Homepage, Dashboard, and User Settings.',
      status: 'Completed',
      priority: 'High',
      dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      project: project1._id,
      assignedTo: user3._id,
      owner: user1._id
    });

    const task2 = await Task.create({
      title: 'Write Frontend Code',
      description: 'Implement modern HTML, CSS layouts, sidebar navigation, statistics panel, and modals.',
      status: 'In Progress',
      priority: 'High',
      dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      project: project1._id,
      assignedTo: user1._id,
      owner: user1._id
    });

    const task3 = await Task.create({
      title: 'Setup Backend Database',
      description: 'Create Mongoose models, configure routes, and setup connection to local MongoDB database.',
      status: 'To Do',
      priority: 'Medium',
      dueDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      project: project1._id,
      assignedTo: user2._id,
      owner: user1._id
    });

    // Mobile App Launch Tasks
    const task4 = await Task.create({
      title: 'App Store Submission',
      description: 'Fill metadata, prepare promotional screenshots, and submit the build for Apple App Store review.',
      status: 'To Do',
      priority: 'High',
      dueDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      project: project2._id,
      assignedTo: user2._id,
      owner: user2._id
    });

    const task5 = await Task.create({
      title: 'Draft Marketing Plan',
      description: 'Prepare social media posters and plan email newsletter campaigns for the release week.',
      status: 'In Progress',
      priority: 'Low',
      dueDate: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
      project: project2._id,
      assignedTo: user1._id,
      owner: user2._id
    });

    console.log('Tasks created successfully.');

    // 4. Create Comments
    console.log('Creating comments...');
    await Comment.create({
      content: 'Wireframes are approved! We can proceed with coding the dashboard layout.',
      task: task1._id,
      user: user1._id
    });

    await Comment.create({
      content: 'Awesome, starting HTML structure and CSS modules today.',
      task: task1._id,
      user: user3._id
    });

    await Comment.create({
      content: 'Almost halfway done with styling the sidebar navigation.',
      task: task2._id,
      user: user1._id
    });

    await Comment.create({
      content: 'Will configure MongoDB collection schemas this afternoon.',
      task: task3._id,
      user: user2._id
    });

    console.log('Comments created successfully.');
    console.log('Database seeded successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();
