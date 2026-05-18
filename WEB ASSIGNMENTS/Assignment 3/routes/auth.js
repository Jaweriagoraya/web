const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isLoggedIn } = require('../middleware/auth');

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
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

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
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

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', { user: res.locals.currentUser });
});

module.exports = router;
