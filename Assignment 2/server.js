const express = require("express");
const methodOverride = require("method-override");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const session = require("express-session");
const flash = require("connect-flash");
const Product = require("./models/Product");
const User = require("./models/User");

// Initialize App
const app = express();

// Connect Database
mongoose.connect("mongodb://localhost:27017/ecommerce")
    .then(() => {
        console.log("MongoDB Connected for Assignment 4");
    })
    .catch((error) => {
        console.error("MongoDB Connection Error:", error);
    });

// Middleware Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session & Flash
app.use(session({
    secret: 'secret_key_assignment_4',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));
app.use(flash());

// Global Middleware
app.use(async (req, res, next) => {
    try {
        const categories = await Product.distinct("category");
        res.locals.allCategories = categories;

        // Auth check
        res.locals.currentUser = null;
        if (req.session.userId) {
            const user = await User.findById(req.session.userId);
            res.locals.currentUser = user;
        }

        res.locals.success = req.flash('success');
        res.locals.error = req.flash('error');
        next();
    } catch (err) {
        next(err);
    }
});

// Admin Authentication Middleware
async function isAdmin(req, res, next) {
    if (req.session.userId && req.session.role === 'admin') {
        const user = await User.findById(req.session.userId);
        if (user) return next();
    }
    req.flash('error', 'Access Denied: Admins Only');
    res.redirect('/admin/login');
}

// Multer Configuration for Image Uploads (Assignment 4 Requirement 3)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- PUBLIC ROUTES ---
app.get("/", (req, res) => {
    res.render("index");
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
        if (search) query.name = { $regex: search, $options: "i" };
        if (category) query.category = category;
        if (minPrice !== null || maxPrice !== null) {
            query.price = {};
            if (minPrice !== null && !Number.isNaN(minPrice)) query.price.$gte = minPrice;
            if (maxPrice !== null && !Number.isNaN(maxPrice)) query.price.$lte = maxPrice;
        }

        const sortOptions = {};
        if (sort === "price_asc") sortOptions.price = 1;
        else if (sort === "price_desc") sortOptions.price = -1;
        else if (sort === "rating_desc") sortOptions.rating = -1;
        else sortOptions.name = 1;

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);
        const products = await Product.find(query)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit);

        res.render("products", {
            products, currentPage: page, totalPages, totalProducts,
            search, category, minPrice: req.query.minPrice || "", maxPrice: req.query.maxPrice || "", sort
        });
    } catch (error) {
        res.status(500).send("Error loading products.");
    }
});

// --- ADMIN ROUTES (Assignment 4) ---

// Admin Login
app.get("/admin/login", (req, res) => {
    res.render("admin/login");
});

app.post("/admin/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && user.role === 'admin' && await user.comparePassword(password)) {
        req.session.userId = user._id;
        req.session.role = user.role;
        req.flash('success', 'Welcome to Admin Dashboard');
        return res.redirect('/admin');
    }
    req.flash('error', 'Invalid Credentials');
    res.redirect('/admin/login');
});

app.get("/admin/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error("Logout Error:", err);
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
});

// Admin Dashboard (Requirement 1)
app.get("/admin", isAdmin, async (req, res) => {
    const products = await Product.find();
    res.render("admin/dashboard", {
        products,
        activePage: "dashboard",
        pageTitle: "Admin Dashboard"
    });
});

// Admin Profile
app.get("/admin/profile", isAdmin, (req, res) => {
    res.render("admin/profile", {
        activePage: "profile",
        pageTitle: "My Profile"
    });
});

// Create Product (Requirement 2)
app.get("/admin/add", isAdmin, async (req, res) => {
    let categories = await Product.distinct("category");
    if (categories.length === 0) categories = ["Men", "Women", "Kids"];
    res.render("admin/add", {
        activePage: "add",
        pageTitle: "Add Product",
        errors: [],
        formData: {},
        categories
    });
});

app.post("/admin/add", isAdmin, upload.single("image"), async (req, res) => {
    const { name, price, category, stock, rating } = req.body;
    // Basic validation (Requirement 2)
    if (!name || !price || !category || !stock) {
        let categories = await Product.distinct("category");
        if (categories.length === 0) categories = ["Men", "Women", "Kids"];
        return res.render("admin/add", {
            activePage: "add",
            pageTitle: "Add Product",
            errors: ["All fields are required"],
            formData: req.body,
            categories
        });
    }

    const product = new Product({
        name, price, category, stock,
        rating: rating || 0,
        image: req.file ? "/uploads/" + req.file.filename : "/1.avif" // Requirement 3
    });
    await product.save();
    req.flash('success', 'Product added successfully');
    res.redirect("/admin");
});

// Edit Product (Requirement 2)
app.get("/admin/edit/:id", isAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        let categories = await Product.distinct("category");
        if (categories.length === 0) categories = ["Men", "Women", "Kids"];
        res.render("admin/edit", {
            product,
            activePage: "dashboard",
            pageTitle: "Edit Product",
            errors: [],
            categories
        });
    } catch (err) {
        res.status(404).send("Product not found");
    }
});

app.put("/admin/edit/:id", isAdmin, upload.single("image"), async (req, res) => {
    const { name, price, category, stock, rating } = req.body;
    const product = await Product.findById(req.params.id);

    product.name = name;
    product.price = price;
    product.category = category;
    product.stock = stock;
    product.rating = rating;
    if (req.file) {
        product.image = "/uploads/" + req.file.filename;
    }

    await product.save();
    req.flash('success', 'Product updated successfully');
    res.redirect("/admin");
});

// Delete Product (Requirement 2)
app.delete("/admin/delete/:id", isAdmin, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    req.flash('success', 'Product deleted');
    res.redirect("/admin");
});

// Seed Route (Convenience)
app.get("/seed-products", async (req, res) => {
    const sampleProducts = [
        { name: "Men Casual Shirt", price: 1999, category: "Men", rating: 4.2, stock: 32, image: "/1.avif" },
        { name: "Women Leather Bag", price: 3499, category: "Women", rating: 4.7, stock: 12, image: "/3.avif" }
    ];
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    res.send("Seeded!");
});

// Error Handling
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
