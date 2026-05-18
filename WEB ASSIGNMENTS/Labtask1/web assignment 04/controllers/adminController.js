const Product = require('../models/Product');
const User = require('../models/User');

const defaultCategories = ['Men', 'Women', 'Kids'];

exports.renderLogin = (req, res) => {
  res.render('admin/login');
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && user.role === 'admin' && await user.comparePassword(password)) {
      req.session.userId = user._id;
      req.session.role = user.role;
      req.flash('success', 'Welcome to Admin Dashboard');
      return res.redirect('/admin');
    }

    req.flash('error', 'Invalid Credentials');
    return res.redirect('/admin/login');
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout Error:', err);
    res.clearCookie('connect.sid');
    res.redirect('/admin/login');
  });
};

exports.renderDashboard = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render('admin/dashboard', {
      products,
      activePage: 'dashboard',
      pageTitle: 'Admin Dashboard'
    });
  } catch (error) {
    next(error);
  }
};

exports.renderProfile = (req, res) => {
  res.render('admin/profile', {
    activePage: 'profile',
    pageTitle: 'My Profile'
  });
};

async function getCategories() {
  const categories = await Product.distinct('category');
  return categories.length ? categories : defaultCategories;
}

exports.renderAddProduct = async (req, res, next) => {
  try {
    const categories = await getCategories();
    res.render('admin/add', {
      activePage: 'add',
      pageTitle: 'Add Product',
      errors: [],
      formData: {},
      categories
    });
  } catch (error) {
    next(error);
  }
};

exports.addProduct = async (req, res, next) => {
  try {
    const { name, price, category, stock, rating } = req.body;
    const categories = await getCategories();

    if (!name || !price || !category || !stock) {
      return res.render('admin/add', {
        activePage: 'add',
        pageTitle: 'Add Product',
        errors: ['All fields are required'],
        formData: req.body,
        categories
      });
    }

    const product = new Product({
      name,
      price,
      category,
      stock,
      rating: rating || 0,
      image: req.file ? `/uploads/${req.file.filename}` : '/1.avif'
    });

    await product.save();
    req.flash('success', 'Product added successfully');
    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
};

exports.renderEditProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    const categories = await getCategories();
    res.render('admin/edit', {
      product,
      activePage: 'dashboard',
      pageTitle: 'Edit Product',
      errors: [],
      categories
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { name, price, category, stock, rating } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    product.name = name;
    product.price = price;
    product.category = category;
    product.stock = stock;
    product.rating = rating;
    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();
    req.flash('success', 'Product updated successfully');
    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    req.flash('success', 'Product deleted');
    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
};