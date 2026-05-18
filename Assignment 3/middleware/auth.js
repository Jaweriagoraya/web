const isLoggedIn = (req, res, next) => {
    if (req.session && req.session.userId) return next();
    req.flash('error', 'You must be logged in to view that page.');
    res.redirect('/login');
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === 'admin') return next();
    req.flash('error', 'Access Denied: Admins Only.');
    res.redirect('/admin/login');
};

module.exports = { isLoggedIn, isAdmin };
