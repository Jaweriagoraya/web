const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get("/", (req, res) => {
    res.render("index");
});

router.get("/seed-products", async (req, res) => {
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

module.exports = router;
