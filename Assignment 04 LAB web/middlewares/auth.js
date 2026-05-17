const jwt = require('jsonwebtoken');

function isLoggedIn(req, res, next) {
    if (req.session && req.session.userId) return next();
    
    if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
        return res.status(401).json({ error: 'Unauthorized', redirect: '/login' });
    }

    req.flash('error', 'You must be logged in to view that page.');
    res.redirect('/login');
}

function isAdmin(req, res, next) {
    if (req.session && req.session.userId && req.session.role === 'admin') return next();
    req.flash('error', 'Access Denied');
    res.redirect('/admin/login');
}

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ error: 'Access Denied: No Token Provided!' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access Denied: No Token Provided!' });
    }

    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not configured');
        return res.status(500).json({ error: 'JWT configuration error' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}

module.exports = {
    isLoggedIn,
    isAdmin,
    verifyToken
};
