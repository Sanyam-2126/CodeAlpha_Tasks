# CampusMart - Student E-Commerce Store

A full-stack responsive E-Commerce web application designed for students. Built using **Node.js, Express.js, MongoDB, EJS**, and styled using **Vanilla CSS**.

This project provides a clean, well-commented student project codebase featuring user authentication, product catalogs, shopping carts, order checkouts, order tracking, and administrative CRUD features.

---

## Features

1. **User Registration & Login**: Session-based user authentication using `express-session` and password hashing with `bcryptjs`.
2. **Product Catalog**: View available products in a responsive grid layout.
3. **Product Details**: Learn more about individual products with full descriptions and large images.
4. **Shopping Cart**: Dynamic cart update capabilities (adding/removing products) preserved in the MongoDB user document.
5. **Checkout & Placement**: Complete purchases to instantly clear the cart and generate a unique customer order record.
6. **Order History**: Review past orders, quantities, totals, and shipment statuses.
7. **Admin Management Panel**: Administrators can create new catalog items (with local image file upload support via `multer` or custom URL shortcuts), edit details, and delete items from the store.
8. **Sample Seed Products**: Comes preloaded with 3 mock products (Hoodie, Notebook, and Headphones) complete with generated local images.

---

## File Structure

```text
/
├── app.js                 # Express Application Entry Point
├── package.json           # Project Configuration and Node Dependencies
├── seeds.js               # Database Populating Seed Script
├── .env                   # Environment Variables Configuration
├── config/
│   └── db.js              # Database connection logic via Mongoose
├── middleware/
│   └── auth.js            # Route protection middlewares (isAuth, isAdmin)
├── models/
│   ├── User.js            # User Schema & Cart management methods
│   ├── Product.js         # Product Catalog Schema
│   └── Order.js           # Checkout Order Schema
├── routes/
│   ├── auth.js            # Authentication routes (register, login, logout)
│   ├── shop.js            # Public catalog and cart/checkout actions
│   └── admin.js           # Admin CRUD panel operations
├── public/
│   ├── css/
│   │   └── style.css      # Custom stylesheet (Responsive layout, grid systems, modals)
│   └── images/
│       ├── hoodie.png     # Seed product image
│       ├── notebook.png   # Seed product image
│       └── headphones.png # Seed product image
├── views/
│   ├── partials/
│   │   ├── header.ejs     # Navbar menu and boilerplate
│   │   └── footer.ejs     # Bottom disclaimer and toggle script
│   ├── index.ejs          # Home page shop list
│   ├── product-detail.ejs # Detail layout
│   ├── cart.ejs           # Cart review page
│   ├── orders.ejs         # Customer order list page
│   ├── login.ejs          # Account login form
│   ├── register.ejs       # Account registration form
│   ├── 403.ejs            # Access forbidden page
│   ├── 404.ejs            # Page not found error
│   ├── 500.ejs            # Database error template
│   └── admin/
│       ├── products.ejs   # Admin catalog view dashboard
│       └── edit-product.ejs# Add & Edit unified form structure
```

---

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed and [MongoDB](https://www.mongodb.com/try/download/community) running locally on your system.

### Installation Steps

1. **Extract/Clone the repository** to your local path.
2. Open terminal inside the root directory and install dependencies:
   ```bash
   npm install
   ```

3. **Check the environment configuration** in the `.env` file. You can change the port or the database URI here:
   ```env
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/student_ecommerce
   SESSION_SECRET=supersecretkeyforstudentproject123
   ```

4. **Seed the database** to preload products and accounts:
   ```bash
   npm run seed
   ```

5. **Start the server**:
   - For standard start:
     ```bash
     npm start
     ```
   - For development auto-reload (uses `nodemon`):
     ```bash
     npm run dev
     ```

6. Open your web browser and navigate to: [http://localhost:3000](http://localhost:3000)

---

## Test Accounts

The following credentials are created by the `npm run seed` command:

### 1. Standard Customer Account
- **Email**: `john@campusmart.com`
- **Password**: `user123`
- *Access permissions*: Can browse catalog, manage shopping cart, and place/view orders. Cannot open administrative routes.

### 2. Admin Account
- **Email**: `admin@campusmart.com`
- **Password**: `admin123`
- *Access permissions*: Full shopping permissions plus access to the **Admin Panel** to create, edit, and delete products.
