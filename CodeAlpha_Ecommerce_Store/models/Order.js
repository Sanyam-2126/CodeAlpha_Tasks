// models/Order.js
// This schema defines order details stored in the database, locking in products and pricing at time of purchase.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  products: [
    {
      product: {
        type: Object, // Embedded snapshot of product info (title, price, description, etc.)
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  user: {
    name: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'Pending', // Order status can be Pending, Processing, Shipped, Completed, Cancelled
    enum: ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
