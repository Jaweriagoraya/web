const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { isLoggedIn } = require('../middleware/auth');

router.get('/', isLoggedIn, async (req, res) => {
    try {
        if (!req.session.cart) req.session.cart = [];
        
        const cartItems = [];
        let cartTotal = 0;

        for (const item of req.session.cart) {
            const product = await Product.findById(item.productId);
            if (product) {
                const subtotal = product.price * item.quantity;
                cartItems.push({
                    product,
                    quantity: item.quantity,
                    subtotal
                });
                cartTotal += subtotal;
            }
        }

        res.render('cart', {
            cartItems,
            cartTotal,
            success: req.flash('success')
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to load cart.');
    }
});

router.post('/add/:id', async (req, res) => {
    try {
        // Check if user is logged in (JSON response for AJAX)
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Please login to add products to your cart.' });
        }

        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        if (!req.session.cart) req.session.cart = [];

        const existing = req.session.cart.find(item => item.productId === productId);
        if (existing) {
            existing.quantity += 1;
        } else {
            req.session.cart.push({ productId, quantity: 1 });
        }

        const totalItems = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
        res.json({ success: true, message: 'Added to cart', cartItemCount: totalItems });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/update/:id', isLoggedIn, (req, res) => {
    const { action } = req.body;
    const productId = req.params.id;
    if (!req.session.cart) return res.redirect('/cart');

    const item = req.session.cart.find(item => item.productId === productId);
    if (item) {
        if (action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease') {
            item.quantity -= 1;
            if (item.quantity <= 0) {
                req.session.cart = req.session.cart.filter(i => i.productId !== productId);
            }
        }
    }
    res.redirect('/cart');
});

router.post('/remove/:id', isLoggedIn, (req, res) => {
    const productId = req.params.id;
    if (!req.session.cart) return res.redirect('/cart');
    req.session.cart = req.session.cart.filter(item => item.productId !== productId);
    res.redirect('/cart');
});

module.exports = router;
