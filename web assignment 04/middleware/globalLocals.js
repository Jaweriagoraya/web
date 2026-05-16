const Product = require('../models/Product');
const User = require('../models/User');

async function setGlobalLocals(req, res, next) {
  try {
    const categories = await Product.distinct('category');
    res.locals.allCategories = categories;

    res.locals.currentUser = null;
    if (req.session?.userId) {
      const user = await User.findById(req.session.userId);
      res.locals.currentUser = user;
    }

    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { setGlobalLocals };