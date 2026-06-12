// routes/admin.js
// Handles administrative actions: listing, adding, editing, and deleting products.
// Includes Multer configuration for file uploads.

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { isAuth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// 1. Configure Multer Disk Storage for product image file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads');
    // Ensure upload directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Save file with a unique timestamp prefix to avoid name collisions
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

// Filter to accept only image formats (PNG, JPG, JPEG)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/webp'
  ) {
    cb(null, true); // Accept file
  } else {
    cb(null, false); // Reject file
  }
};

// Initialize multer instance
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // Max size: 5MB
});

// Protect all admin routes using both authentication and authorization middleware
router.use(isAuth, isAdmin);

// GET: Admin Dashboard - Product Management Directory
router.get('/admin/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('admin/products', {
      products: products,
      pageTitle: 'Admin - Manage Products',
      path: '/admin/products'
    });
  } catch (error) {
    console.error('Admin Products error:', error);
    res.status(500).render('500', {
      pageTitle: 'Server Error',
      path: '/500'
    });
  }
});

// GET: Render Create Product Form
router.get('/admin/add-product', (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/products',
    editing: false,
    errorMessage: null
  });
});

// POST: Handle Create Product Submission
router.post('/admin/add-product', upload.single('image'), async (req, res) => {
  const { title, price, category, imageUrl, description } = req.body;
  
  // Choose correct image path: uploaded file path or fallback to url input
  let finalImageUrl = '';
  if (req.file) {
    // Save path relative to the public directory
    finalImageUrl = `/uploads/${req.file.filename}`;
  } else if (imageUrl) {
    finalImageUrl = imageUrl;
  }

  // Validation check
  if (!title || !price || !description || !finalImageUrl) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/products',
      editing: false,
      errorMessage: 'Please provide all details, including a product image.',
      product: { title, price, category, imageUrl, description }
    });
  }

  try {
    const product = new Product({
      title: title,
      price: parseFloat(price),
      category: category,
      imageUrl: finalImageUrl,
      description: description
    });

    await product.save();
    console.log(`Product created: ${product.title}`);
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Create Product error:', error);
    res.status(500).render('500', {
      pageTitle: 'Server Error',
      path: '/500'
    });
  }
});

// GET: Render Edit Product Form
router.get('/admin/edit-product/:id', async (req, res) => {
  const prodId = req.params.id;
  try {
    const product = await Product.findById(prodId);
    if (!product) {
      return res.redirect('/admin/products');
    }
    
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/products',
      editing: true,
      product: product,
      errorMessage: null
    });
  } catch (error) {
    console.error('Edit Product GET error:', error);
    res.status(500).render('500', {
      pageTitle: 'Server Error',
      path: '/500'
    });
  }
});

// POST: Handle Product Update Form Submission
router.post('/admin/edit-product', upload.single('image'), async (req, res) => {
  const { productId, title, price, category, imageUrl, description } = req.body;
  
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.redirect('/admin/products');
    }

    // Determine final image path
    let finalImageUrl = product.imageUrl; // Keep old image path as default
    if (req.file) {
      // If a new file is uploaded, remove the old local upload file if applicable to save space
      if (product.imageUrl.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '../public', product.imageUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      finalImageUrl = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      // If URL was provided instead
      finalImageUrl = imageUrl;
    }

    // Update product fields
    product.title = title;
    product.price = parseFloat(price);
    product.category = category;
    product.imageUrl = finalImageUrl;
    product.description = description;

    await product.save();
    console.log(`Product updated: ${product.title}`);
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Edit Product POST error:', error);
    res.status(500).render('500', {
      pageTitle: 'Server Error',
      path: '/500'
    });
  }
});

// POST: Handle Product Deletion
router.post('/admin/delete-product', async (req, res) => {
  const { productId } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.redirect('/admin/products');
    }

    // Delete local upload image file if it exists to clean up disk storage
    if (product.imageUrl.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, '../public', product.imageUrl);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await Product.findByIdAndDelete(productId);
    console.log(`Product deleted ID: ${productId}`);
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Delete Product error:', error);
    res.status(500).render('500', {
      pageTitle: 'Server Error',
      path: '/500'
    });
  }
});

module.exports = router;
