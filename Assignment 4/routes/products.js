const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get("/", async (req, res) => {
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

module.exports = router;
