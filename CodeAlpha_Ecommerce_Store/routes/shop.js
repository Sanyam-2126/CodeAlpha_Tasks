// routes/shop.js
// Handles core e-commerce shop actions: browsing, cart operations, checking out, and order tracking.

const express = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const { isAuth } = require('../middleware/auth');

const router = express.Router();

// GET: Home Page - Product Listing Catalog
router.get('/', async (req, res) => {
  try {
    // Retrieve all products from database
    const products = await Product.find();
    
    res.render('index', {
      products: products,
      pageTitle: 'Shop Catalog',
      path: '/'
    });
  } catch (error) {
    console.error('Home Page error:', error);
    res.status(500).render('500', {
      pageTitle: 'Server Error',
      path: '/500'
    });
  }
});

// GET: Product Detail Page
router.get('/product/:id', async (req, res) => {
  const prodId = req.params.id;
  try {
    // Find specific product by ID
    const product = await Product.findById(prodId);
    if (!product) {
      return res.status(404).render('404', {
        pageTitle: 'Product Not Found',
        path: '/404'
      });
    }

    res.render('product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/' // Mark catalog as active tab in navbar
    });
  } catch (error) {
    console.error('Product Detail error:', error);
    res.status(500).render('500', {
      pageTitle: 'Server Error',
      path: '/500'
    });
  }
});

// GET: View Shopping Cart (Requires Authentication)
router.get('/cart', isAuth, async (req, res) => {
  try {
    // Fetch latest user document from DB & populate references to Product collection in cart
    const userObj = await User.findById(req.session.user._id).populate('cart.items.productId');
    
    // Filter out items where the corresponding product has been deleted from the database
    const cartItems = userObj.cart.items.filter(item => item.productId !== null);
    
    // Calculate total price of all cart items
    let totalPrice = 0;
    cartItems.forEach(item => {
      totalPrice += item.productId.price * item.quantity;
    });

    res.render('cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      cartItems: cartItems,
      totalPrice: totalPrice
    });
  } catch (error) {
    console.error('View Cart error:', error);
    res.status(500).render('500', {
      pageTitle: 'Server Error',
      path: '/500'
    });
  }
});

// POST: Add Product to Cart (Requires Authentication)
router.post('/cart/add', isAuth, async (req, res) => {
  const { productId } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.redirect('/');
    }

    // Load full user object from DB to call the schema method
    const userObj = await User.findById(req.session.user._id);
    await userObj.addToCart(product);

    // Update cart session state to keep navbar count in sync without DB re-queries
    req.session.user = userObj;
    
    res.redirect('/cart');
  } catch (error) {
    console.error('Add to Cart error:', error);
    res.status(500).render('500', {
      pageTitle: 'Server Error',
      path: '/500'
    });
  }
});

// POST: Remove Product from Cart (Requires Authentication)
router.post('/cart/delete', isAuth, async (req, res) => {
  const { productId } = req.body;
  try {
    const userObj = await User.findById(req.session.user._id);
    await userObj.removeFromCart(productId);

    // Update cart session state
    req.session.user = userObj;
    
    res.redirect('/cart');
  } catch (error) {
    console.error('Delete Cart Item error:', error);
    res.status(500).render('500', {
      pageTitle: 'Server Error',
      path: '/500'
    });
  }
});

// POST: Checkout & Place Order (Requires Authentication)
router.post('/create-order', isAuth, async (req, res) => {
  try {
    // 1. Fetch user and populate their cart items
    const userObj = await User.findById(req.session.user._id).populate('cart.items.productId');
    
    // Filter out deleted products
    const cartItems = userObj.cart.items.filter(item => item.productId !== null);
    if (cartItems.length === 0) {
      return res.redirect('/cart');
    }

    // 2. Format items to snapshot their product details
    const orderProducts = cartItems.map(item => {
      return {
        product: { ...item.productId._doc }, // Spread the actual mongoose product document fields
        quantity: item.quantity
      };
    });

    // 3. Compute overall order cost
    let totalPrice = 0;
    cartItems.forEach(item => {
      totalPrice += item.productId.price * item.quantity;
    });

    // 4. Create and save the order
    const order = new Order({
      user: {
        name: userObj.name,
        userId: userObj._id
      },
      products: orderProducts,
      totalPrice: totalPrice
    });

    await order.save();

    // 5. Clear the user's cart in the DB and session state
    await userObj.clearCart();
    req.session.user = userObj;

    // Redirect user to their order history page
    res.redirect('/orders');
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).render('500', {
      pageTitle: 'Server Error',
      path: '/500'
    });
  }
});

// GET: View Order History (Requires Authentication)
router.get('/orders', isAuth, async (req, res) => {
  try {
    // Retrieve all orders belonging to the logged-in user, sorted newest first
    const orders = await Order.find({ 'user.userId': req.session.user._id }).sort({ createdAt: -1 });
    
    res.render('orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders
    });
  } catch (error) {
    console.error('Order History error:', error);
    res.status(500).render('500', {
      pageTitle: 'Server Error',
      path: '/500'
    });
  }
});

// POST: Cancel Order (Requires Authentication)
router.post('/order/cancel', isAuth, async (req, res) => {
  const { orderId } = req.body;
  try {
    const order = await Order.findById(orderId);
    
    // Check if order exists and belongs to the current logged-in user
    if (!order || order.user.userId.toString() !== req.session.user._id.toString()) {
      return res.redirect('/orders');
    }

    // Only allow cancelling if order is Pending or Processing
    if (order.status === 'Pending' || order.status === 'Processing') {
      order.status = 'Cancelled';
      await order.save();
    }

    res.redirect('/orders');
  } catch (error) {
    console.error('Cancel Order error:', error);
    res.status(500).render('500', {
      pageTitle: 'Server Error',
      path: '/500'
    });
  }
});

module.exports = router;
