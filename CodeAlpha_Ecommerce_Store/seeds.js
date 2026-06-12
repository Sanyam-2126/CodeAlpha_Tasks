// seeds.js
// Seeds the database with default users (standard and admin) and sample products.

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const connectDB = require('./config/db');

const seedDatabase = async () => {
  try {
    // 1. Establish connection to the database
    await connectDB();

    // 2. Clean up existing collections to start fresh
    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    console.log('Collections cleared.');

    // 3. Create Default Users (Hashed Passwords)
    console.log('Generating seed users...');
    const hashedUserPassword = await bcrypt.hash('user123', 12);
    const hashedAdminPassword = await bcrypt.hash('admin123', 12);

    const standardUser = new User({
      name: 'John Doe',
      email: 'john@campusmart.com',
      password: hashedUserPassword,
      isAdmin: false,
      cart: { items: [] }
    });

    const adminUser = new User({
      name: 'Campus Admin',
      email: 'admin@campusmart.com',
      password: hashedAdminPassword,
      isAdmin: true,
      cart: { items: [] }
    });

    await standardUser.save();
    await adminUser.save();
    console.log('Seed users created successfully!');

    // 4. Create Sample Products
    console.log('Generating seed products...');
    const sampleProducts = [
      {
        title: 'Official Campus Varsity Hoodie',
        price: 39.99,
        description: 'Stay warm and show your school spirit with this cozy navy blue college hoodie. Crafted from a soft cotton-blend fleece, it features the classic varsity lettering. Perfect for late-night library study sessions or chilly game days.',
        imageUrl: '/images/hoodie.png',
        category: 'Clothing'
      },
      {
        title: 'Premium Hardcover Study Notebook',
        price: 12.49,
        description: 'Designed for meticulous students. This hardcover journal features high-quality acid-free pages, a pen loop holder, and an elastic closure strap. Comes with a sleek silver ballpoint gel pen to capture your lecture notes.',
        imageUrl: '/images/notebook.png',
        category: 'Books & Academics'
      },
      {
        title: 'ANC Bluetooth Wireless Headphones',
        price: 79.99,
        description: 'Block out dorm room noise and focus on your studies. These matte black over-ear wireless headphones feature active noise cancelling (ANC), deep bass, and up to 30 hours of continuous battery life on a single charge.',
        imageUrl: '/images/headphones.png',
        category: 'Electronics'
      }
    ];

    await Product.insertMany(sampleProducts);
    console.log('Seed products created successfully!');

    console.log('Database seeding completed successfully. Closing connection...');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding process failed:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Execute seeding logic
seedDatabase();
