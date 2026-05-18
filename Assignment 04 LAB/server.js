const multer = require("multer");
const express = require("express");
const methodOverride = require("method-override");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Product = require("./models/Product");
const User = require("./models/User");
const session = require('express-session');
const MongoStoreLib = require('connect-mongo');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');

const categories = ["Men", "Women", "Girls", "New in", "Kids"];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

mongoose.connect("mongodb://localhost:27017/ecommerce")
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((error) => {
        console.error(error);
    });

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Sessions
// Create a compatible MongoStore instance across connect-mongo versions
let mongoStoreInstance;
try {
    if (MongoStoreLib && typeof MongoStoreLib.create === 'function') {
        mongoStoreInstance = MongoStoreLib.create({ mongoUrl: 'mongodb://localhost:27017/ecommerce' });
    } else if (typeof MongoStoreLib === 'function') {
        // older versions: require('connect-mongo')(session)
        const MongoStoreFactory = MongoStoreLib(session);
        mongoStoreInstance = new MongoStoreFactory({ mongoUrl: 'mongodb://localhost:27017/ecommerce' });
    } else {
        console.warn('connect-mongo: compatible API not detected; using default session store (MemoryStore).');
        mongoStoreInstance = undefined;
    }
} catch (err) {
    console.error('Failed to create MongoStore instance:', err);
    mongoStoreInstance = undefined;
}

app.use(session({
    secret: 'replace_this_with_a_strong_secret',
    resave: false,
    saveUninitialized: false,
    store: mongoStoreInstance,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Flash messages
app.use(flash());

// expose user and flash messages to views
app.use(async (req, res, next) => {
    res.locals.currentUser = null;
    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId).select('name email role');
            res.locals.currentUser = user;
        } catch (err) {
            res.locals.currentUser = null;
        }
    }
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

function isLoggedIn(req, res, next) {
    if (req.session && req.session.userId) return next();
    req.flash('error', 'You must be logged in to view that page.');
    res.redirect('/login');
}

function isAdmin(req, res, next) {
    if (req.session && req.session.userId && req.session.role === 'admin') return next();
    req.flash('error', 'Access Denied');
    res.redirect('/admin/login');
}

function validateProductData(body) {
    const errors = [];
    if (!body.name || !body.name.trim()) errors.push("Product name is required.");
    if (!body.category || !body.category.trim()) errors.push("Category is required.");
    if (!body.price || Number.isNaN(Number(body.price)) || Number(body.price) <= 0) errors.push("Price must be a valid number greater than zero.");
    if (!body.stock || Number.isNaN(Number(body.stock)) || Number(body.stock) < 0) errors.push("Stock must be a valid number.");
    return errors;
}

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/seed-products", async (req, res) => {
    try {
        const sampleProducts = [
            { name: "Men Casual Shirt", price: 1999, category: "Men", rating: 4.2, stock: 32, image: "/1.avif" },
            { name: "Girls Summer Dress", price: 1599, category: "Girls", rating: 4.5, stock: 18, image: "/2.avif" },
            { name: "Women Leather Bag", price: 3499, category: "Women", rating: 4.7, stock: 12, image: "/3.avif" },
            { name: "Home Accent Lamp", price: 1200, category: "Home", rating: 4.1, stock: 27, image: "/4.avif" },
            { name: "Men Formal Pants", price: 2599, category: "Men", rating: 4.3, stock: 22, image: "/5.avif" },
            { name: "Girls Printed Top", price: 999, category: "Girls", rating: 4.0, stock: 34, image: "/6.avif" },
            { name: "Women Sports Jacket", price: 2899, category: "Women", rating: 4.4, stock: 15, image: "/7.avif" },
            { name: "Home Cushion Set", price: 799, category: "Home", rating: 4.6, stock: 26, image: "/1.avif" },
            { name: "Men Running Shoes", price: 3999, category: "Men", rating: 4.8, stock: 14, image: "/2.avif" },
            { name: "Girls Denim Jacket", price: 1799, category: "Girls", rating: 4.3, stock: 21, image: "/3.avif" },
            { name: "Women Heeled Sandals", price: 2199, category: "Women", rating: 4.5, stock: 19, image: "/4.avif" },
            { name: "Home Ceramic Vase", price: 650, category: "Home", rating: 4.2, stock: 28, image: "/5.avif" },
            { name: "Men Sweatshirt", price: 2099, category: "Men", rating: 4.1, stock: 30, image: "/6.avif" },
            { name: "Girls Party Skirt", price: 1299, category: "Girls", rating: 4.6, stock: 16, image: "/7.avif" },
            { name: "Women Denim Jeans", price: 2399, category: "Women", rating: 4.2, stock: 20, image: "/1.avif" },
            { name: "Home Wall Art", price: 1499, category: "Home", rating: 4.3, stock: 25, image: "/2.avif" },
            { name: "Men Polo T-Shirt", price: 1299, category: "Men", rating: 4.0, stock: 29, image: "/3.avif" },
            { name: "Girls Leggings", price: 899, category: "Girls", rating: 4.1, stock: 36, image: "/4.avif" },
            { name: "Women Blouse", price: 1699, category: "Women", rating: 4.4, stock: 17, image: "/5.avif" },
            { name: "Home Kitchen Set", price: 1799, category: "Home", rating: 4.5, stock: 13, image: "/6.avif" },
            { name: "Men Winter Coat", price: 4999, category: "Men", rating: 4.7, stock: 9, image: "/7.avif" },
            { name: "Girls Sweatshirt", price: 1199, category: "Girls", rating: 4.2, stock: 24, image: "/1.avif" },
            { name: "Women Casual Dress", price: 1899, category: "Women", rating: 4.3, stock: 18, image: "/2.avif" },
            { name: "Home Table Lamp", price: 999, category: "Home", rating: 4.0, stock: 32, image: "/3.avif" }
        ];

        await Product.deleteMany({});
        await Product.insertMany(sampleProducts);
        res.send(`Seeded ${sampleProducts.length} products successfully.`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to seed products.");
    }
});

app.get("/products", async (req, res) => {
    try {
        const search = (req.query.search || "").trim();
        const category = req.query.category || "";
        const sort = req.query.sort || "";
        const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
        const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = 8;

        const query = {};
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        if (category) {
            query.category = category;
        }
        if (minPrice !== null || maxPrice !== null) {
            query.price = {};
            if (minPrice !== null && !Number.isNaN(minPrice)) query.price.$gte = minPrice;
            if (maxPrice !== null && !Number.isNaN(maxPrice)) query.price.$lte = maxPrice;
            if (Object.keys(query.price).length === 0) delete query.price;
        }

        const sortOptions = {};
        if (sort === "price_asc") {
            sortOptions.price = 1;
        } else if (sort === "price_desc") {
            sortOptions.price = -1;
        } else if (sort === "rating_desc") {
            sortOptions.rating = -1;
        } else {
            sortOptions.name = 1;
        }

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.max(1, Math.ceil(totalProducts / limit));
        const products = await Product.find(query)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit);

        res.render("products", {
            products,
            currentPage: page,
            totalPages,
            totalProducts,
            search,
            category,
            minPrice: req.query.minPrice || "",
            maxPrice: req.query.maxPrice || "",
            sort
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Unable to load products.");
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    try {
        const { name, email, password, passwordConfirm } = req.body;
        if (!name || !email || !password) {
            req.flash('error', 'All fields are required.');
            return res.redirect('/register');
        }
        if (password.length < 6) {
            req.flash('error', 'Password must be at least 6 characters.');
            return res.redirect('/register');
        }
        if (password !== passwordConfirm) {
            req.flash('error', 'Passwords do not match.');
            return res.redirect('/register');
        }
        const existing = await User.findOne({ email });
        if (existing) {
            req.flash('error', 'Email already registered.');
            return res.redirect('/register');
        }
        const user = new User({ name, email, password });
        await user.save();
        req.session.userId = user._id;
        req.session.role = user.role;
        req.flash('success', `Welcome, ${user.name}!`);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Registration failed.');
        res.redirect('/register');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }
        const ok = await user.comparePassword(password);
        if (!ok) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }
        req.session.userId = user._id;
        req.session.role = user.role;
        req.flash('success', `Welcome back, ${user.name}!`);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Login failed.');
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// Admin login (uses User with role 'admin')
app.get('/admin/login', (req, res) => {
    res.render('admin/login', { error: req.flash('error') });
});

app.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Invalid credentials.');
            return res.redirect('/admin/login');
        }
        const ok = await user.comparePassword(password);
        if (!ok || user.role !== 'admin') {
            req.flash('error', 'Invalid credentials or not an admin.');
            return res.redirect('/admin/login');
        }
        req.session.userId = user._id;
        req.session.role = user.role;
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Admin login failed.');
        res.redirect('/admin/login');
    }
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
});

const adminRouter = express.Router();
adminRouter.use(isAdmin);

adminRouter.get("/", async (req, res) => {
    const products = await Product.find();
    res.render("admin/dashboard", {
        products,
        activePage: "dashboard",
        pageTitle: "Dashboard",
        subtitle: "Manage your product inventory and monitor stock",
    });
});

adminRouter.get("/add", (req, res) => {
    res.render("admin/add", {
        activePage: "add",
        pageTitle: "Add Product",
        categories,
        formData: {},
        errors: []
    });
});

adminRouter.post("/add", upload.single("image"), async (req, res) => {
    const errors = validateProductData(req.body);
    if (errors.length) {
        return res.status(400).render("admin/add", {
            activePage: "add",
            pageTitle: "Add Product",
            categories,
            formData: req.body,
            errors
        });
    }

    try {
        const { name, price, category, rating, stock } = req.body;
        const product = new Product({
            name: name.trim(),
            price: Number(price),
            category,
            rating: rating ? Number(rating) : 0,
            stock: Number(stock),
            image: req.file ? "/uploads/" + req.file.filename : "/1.avif"
        });
        await product.save();
        res.redirect("/admin");
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to add product.");
    }
});

adminRouter.get("/edit/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send("Product not found.");
        }
        res.render("admin/edit", {
            product,
            activePage: "dashboard",
            pageTitle: "Edit Product",
            categories,
            errors: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to load product.");
    }
});

adminRouter.put("/edit/:id", upload.single("image"), async (req, res) => {
    console.log('PUT /admin/edit/:id invoked for id=', req.params.id);
    console.log('body:', req.body);
    console.log('file:', req.file ? req.file.filename : 'no file');
    const errors = validateProductData(req.body);
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send("Product not found.");
        }
        if (errors.length) {
            return res.status(400).render("admin/edit", {
                product,
                activePage: "dashboard",
                pageTitle: "Edit Product",
                categories,
                errors
            });
        }

        product.name = req.body.name.trim();
        product.price = Number(req.body.price);
        product.category = req.body.category;
        product.rating = req.body.rating ? Number(req.body.rating) : 0;
        product.stock = Number(req.body.stock);
        if (req.file) {
            product.image = "/uploads/" + req.file.filename;
        }
        await product.save();
        res.redirect("/admin");
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to update product.");
    }
});

adminRouter.delete("/delete/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect("/admin");
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to delete product.");
    }
});

app.use("/admin", adminRouter);

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
