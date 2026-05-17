const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const { verifyToken } = require("../middlewares/auth");

// Public: Get all products
router.get("/products", async (req, res) => {
    try {
        const search = (req.query.search || "").trim();
        const category = req.query.category || "";
        const sort = req.query.sort || "";
        const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
        const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = 8;

        const filters = [
            { image: { $exists: true, $ne: "" } },
            { name: { $not: /coffee maker/i } }
        ];
        if (search) filters.push({ name: { $regex: search, $options: "i" } });
        if (category) filters.push({ category });
        if (minPrice !== null || maxPrice !== null) {
            const priceFilter = {};
            if (minPrice !== null && !Number.isNaN(minPrice)) priceFilter.$gte = minPrice;
            if (maxPrice !== null && !Number.isNaN(maxPrice)) priceFilter.$lte = maxPrice;
            if (Object.keys(priceFilter).length > 0) {
                filters.push({ price: priceFilter });
            }
        }

        const query = filters.length === 1 ? filters[0] : { $and: filters };

        const sortOptions = {};
        if (sort === "price_asc") sortOptions.price = 1;
        else if (sort === "price_desc") sortOptions.price = -1;
        else if (sort === "rating_desc") sortOptions.rating = -1;
        else sortOptions.name = 1;

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.max(1, Math.ceil(totalProducts / limit));
        const products = await Product.find(query)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            products,
            currentPage: page,
            totalPages,
            totalProducts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unable to load products." });
    }
});

// Public: Get single product
router.get("/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unable to fetch product" });
    }
});

// Auth: Login and get JWT
router.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const ok = await user.comparePassword(password);
        if (!ok) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured');
            return res.status(500).json({ error: 'JWT configuration error' });
        }

        // Generate JWT
        const token = jwt.sign(
            { user_id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: "Login successful",
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Login failed" });
    }
});

// Protected: Submit an order
router.post("/orders", verifyToken, async (req, res) => {
    try {
        const { products, totalAmount } = req.body;
        if (!products || !totalAmount) {
            return res.status(400).json({ error: "Products and totalAmount are required" });
        }

        const order = new Order({
            user: req.user.user_id,
            products,
            totalAmount
        });

        await order.save();
        res.status(201).json({ message: "Order created successfully", order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create order" });
    }
});

// Protected: Get user profile
router.get("/user/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.user_id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
});

module.exports = router;
