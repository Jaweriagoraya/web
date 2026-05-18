require('dotenv').config();
const express = require("express");
const methodOverride = require("method-override");
const path = require("path");
const session = require('express-session');
const MongoStoreLib = require('connect-mongo');
const flash = require('connect-flash');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

// Initialize App
const app = express();

// Connect Database
connectDB();

const expressLayouts = require('express-ejs-layouts');

// Middleware
app.use(expressLayouts);
app.set('layout', 'layout');
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session Configuration
let mongoStoreInstance;
try {
    mongoStoreInstance = MongoStoreLib.create({ mongoUrl: 'mongodb://localhost:27017/ecommerce' });
} catch (err) {
    console.error('Failed to create MongoStore instance:', err);
}

app.use(session({
    secret: process.env.SESSION_SECRET || 'replace_this_with_a_strong_secret',
    resave: false,
    saveUninitialized: false,
    store: mongoStoreInstance,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

app.use(flash());

// Global View Variables
app.use(async (req, res, next) => {
    try {
        const User = require('./models/User');
        const Product = require('./models/Product');
        const user = req.session.userId ? await User.findById(req.session.userId) : null;
        const categories = await Product.distinct('category', {
            image: { $exists: true, $ne: "" },
            name: { $not: /coffee maker/i }
        });

        let cartCount = 0;
        if (req.session.cart) {
            cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
        }

        res.locals.currentUser = user;
        res.locals.allCategories = categories;
        res.locals.success = req.flash('success');
        res.locals.error = req.flash('error');
        res.locals.cartItemCount = cartCount;
        next();
    } catch (err) {
        next(err);
    }
});

// Import Routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');
const onsaleRoutes = require('./routes/onsale');

// Use Routes
app.use('/api/v1', apiRoutes);
app.use('/', indexRoutes);
app.use('/', authRoutes); // /login, /register, /logout
app.use('/', onsaleRoutes); // /onsale-products
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/admin', adminRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
