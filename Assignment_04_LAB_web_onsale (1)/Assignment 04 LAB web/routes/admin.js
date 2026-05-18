const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Product = require('../models/Product');
const User = require('../models/User');
const { isAdmin } = require('../middleware/auth');

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const categories = ["Men", "Women", "Girls", "New in", "Kids"];

function validateProductData(body) {
    const errors = [];
    if (!body.name || !body.name.trim()) errors.push("Product name is required.");
    if (/coffee maker/i.test(body.name || "")) errors.push("Product name cannot contain 'coffee maker'.");
    if (!body.category || !body.category.trim()) errors.push("Category is required.");
    if (!body.price || Number.isNaN(Number(body.price)) || Number(body.price) <= 0) errors.push("Price must be a valid number greater than zero.");
    if (!body.stock || Number.isNaN(Number(body.stock)) || Number(body.stock) < 0) errors.push("Stock must be a valid number.");
    return errors;
}

// --- PUBLIC Admin Routes (no auth required) ---

router.get('/login', (req, res) => {
    res.render('admin/login', {
        layout: false,
        error: req.flash('error'),
        success: req.flash('success')
    });
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.role !== 'admin') {
            req.flash('error', 'Invalid credentials or not an admin.');
            return res.redirect('/admin/login');
        }
        const ok = await user.comparePassword(password);
        if (!ok) {
            req.flash('error', 'Invalid credentials.');
            return res.redirect('/admin/login');
        }
        req.session.userId = user._id;
        req.session.role = user.role;
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/login');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
});

router.get('/register', (req, res) => {
    res.render('admin/register', {
        layout: false,
        error: req.flash('error'),
        success: req.flash('success'),
        formData: {}
    });
});

router.post('/register', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    const errors = [];

    if (!name || !name.trim()) errors.push('Full name is required.');
    if (!email || !email.trim()) errors.push('Email is required.');
    if (!password || password.length < 6) errors.push('Password must be at least 6 characters.');
    if (password !== confirmPassword) errors.push('Passwords do not match.');

    if (errors.length) {
        return res.render('admin/register', {
            layout: false,
            error: errors,
            success: [],
            formData: { name, email }
        });
    }

    try {
        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.render('admin/register', {
                layout: false,
                error: ['An account with this email already exists.'],
                success: [],
                formData: { name, email }
            });
        }
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            role: 'admin'
        });
        await user.save();
        req.flash('success', 'Admin account created! You can now log in.');
        res.redirect('/admin/login');
    } catch (err) {
        console.error(err);
        res.render('admin/register', {
            layout: false,
            error: ['Something went wrong. Please try again.'],
            success: [],
            formData: { name, email }
        });
    }
});

// --- PROTECTED Admin Routes (isAdmin required) ---

router.get("/", isAdmin, async (req, res) => {
    const products = await Product.find({
        image: { $exists: true, $ne: "" },
        name: { $not: /coffee maker/i }
    });
    res.render("admin/dashboard", {
        layout: false,
        products,
        activePage: "dashboard",
        pageTitle: "Dashboard",
        subtitle: "Manage your product inventory and monitor stock",
    });
});

router.get("/add", isAdmin, (req, res) => {
    res.render("admin/add", {
        layout: false,
        activePage: "add",
        pageTitle: "Add Product",
        categories,
        formData: {},
        errors: []
    });
});

router.post("/add", isAdmin, upload.single("image"), async (req, res) => {
    const errors = validateProductData(req.body);
    if (errors.length) {
        return res.status(400).render("admin/add", {
            layout: false,
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

router.get("/edit/:id", isAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send("Product not found.");
        res.render("admin/edit", {
            layout: false,
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

router.put("/edit/:id", isAdmin, upload.single("image"), async (req, res) => {
    const errors = validateProductData(req.body);
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send("Product not found.");
        if (errors.length) {
            return res.status(400).render("admin/edit", {
                layout: false,
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
        if (req.file) product.image = "/uploads/" + req.file.filename;
        await product.save();
        res.redirect("/admin");
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to update product.");
    }
});

router.delete("/delete/:id", isAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect("/admin");
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to delete product.");
    }
});



module.exports = router;
