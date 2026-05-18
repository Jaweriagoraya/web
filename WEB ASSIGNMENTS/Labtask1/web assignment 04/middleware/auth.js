const User = require('../models/User');

async function isAdmin(req, res, next) {
  if (req.session?.userId && req.session.role === 'admin') {
    const user = await User.findById(req.session.userId);
    if (user) {
      return next();
    }
  }

  req.flash('error', 'Access Denied: Admins Only');
  return res.redirect('/admin/login');
}

module.exports = { isAdmin };