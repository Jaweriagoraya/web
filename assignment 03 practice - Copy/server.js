const express = require("express");
const methodOverride = require("method-override");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("./models/Product");

// Initialize App
const app = express();

// Connect Database
mongoose.connect("mongodb://localhost:27017/ecommerce")
    .then(() => {
        console.log("MongoDB Connected for Assignment 3");
    })
    .catch((error) => {
        console.error("MongoDB Connection Error:", error);
    });

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Global Middleware for Categories (Used in Navbar)
app.use(async (req, res, next) => {
    try {
        const categories = await Product.distinct("category");
        res.locals.allCategories = categories;
        res.locals.currentUser = null; // Removed Auth features
        res.locals.success = [];
        res.locals.error = [];
        next();
    } catch (err) {
        next(err);
    }
});

// Routes
app.get("/", (req, res) => {
    res.render("index");
});

// Assignment 3: Dynamic Product Catalog Route
app.get("/products", async (req, res) => {
    try {
        const search = (req.query.search || "").trim();
        const category = req.query.category || "";
        const sort = req.query.sort || "";
        const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
        const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = 8; // Requirement: Limit of 8 products per page

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
        const totalPages = Math.ceil(totalProducts / limit);
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

// Seed Route for testing
app.get("/seed-products", async (req, res) => {
    try {
        const sampleProducts = [
            { name: "Men Casual Shirt", price: 1999, category: "Men", rating: 4.2, stock: 32, image: "/1.avif" },
            { name: "Girls Summer Dress", price: 1599, category: "Women", rating: 4.5, stock: 18, image: "/2.avif" },
            { name: "Women Leather Bag", price: 3499, category: "Women", rating: 4.7, stock: 12, image: "/3.avif" },
            { name: "Men Formal Pants", price: 2599, category: "Men", rating: 4.3, stock: 22, image: "/5.avif" },
            { name: "Men Sweatshirt", price: 2099, category: "Men", rating: 4.1, stock: 30, image: "/6.avif" },
            { name: "Women Denim Jeans", price: 2399, category: "Women", rating: 4.2, stock: 20, image: "/1.avif" },
            { name: "Men Polo T-Shirt", price: 1299, category: "Men", rating: 4.0, stock: 29, image: "/3.avif" },
            { name: "Women Blouse", price: 1699, category: "Women", rating: 4.4, stock: 17, image: "/5.avif" },
            { name: "Men Winter Coat", price: 4999, category: "Men", rating: 4.7, stock: 9, image: "/7.avif" },
            { name: "Women Casual Dress", price: 1899, category: "Women", rating: 4.3, stock: 18, image: "/2.avif" }
        ];

        await Product.deleteMany({});
        await Product.insertMany(sampleProducts);
        res.send("Database seeded with Assignment 3 sample products.");
    } catch (err) {
        res.status(500).send("Seeding failed.");
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
