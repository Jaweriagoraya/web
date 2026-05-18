const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /onsale-products
// Fetches ALL on-sale products (optionally filtered) in a single query 
// and passes the full dataset to the EJS view. Pagination (10 per page) 
// happens client-side via jQuery.
router.get('/onsale-products', async (req, res) => {
    try {
        const search = (req.query.search || "").trim();
        const category = req.query.category || "";
        const sort = req.query.sort || "";
        const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
        const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;

        const filters = [
            { isOnSale: true }
        ];

        if (search) {
            filters.push({ name: { $regex: search, $options: "i" } });
        }
        if (category) {
            filters.push({ category });
        }
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
        if (sort === "price_asc") {
            sortOptions.price = 1;
        } else if (sort === "price_desc") {
            sortOptions.price = -1;
        } else if (sort === "rating_desc") {
            sortOptions.rating = -1;
        } else {
            sortOptions.name = 1;
        }

        const products = await Product.find(query).sort(sortOptions);

        res.render('onsale', { 
            products,
            search,
            category,
            minPrice: req.query.minPrice || "",
            maxPrice: req.query.maxPrice || "",
            sort
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Unable to load on-sale products.');
    }
});

module.exports = router;
