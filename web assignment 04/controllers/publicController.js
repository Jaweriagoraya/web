const Product = require('../models/Product');

exports.renderHome = (req, res) => {
  res.render('index');
};

exports.renderProducts = async (req, res, next) => {
  try {
    const search = (req.query.search || '').trim();
    const category = req.query.category || '';
    const sort = req.query.sort || '';
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 8;

    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (minPrice !== null || maxPrice !== null) {
      query.price = {};
      if (minPrice !== null && !Number.isNaN(minPrice)) query.price.$gte = minPrice;
      if (maxPrice !== null && !Number.isNaN(maxPrice)) query.price.$lte = maxPrice;
    }

    const sortOptions = {};
    if (sort === 'price_asc') sortOptions.price = 1;
    else if (sort === 'price_desc') sortOptions.price = -1;
    else if (sort === 'rating_desc') sortOptions.rating = -1;
    else sortOptions.name = 1;

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    res.render('products', {
      products,
      currentPage: page,
      totalPages,
      totalProducts,
      search,
      category,
      minPrice: req.query.minPrice || '',
      maxPrice: req.query.maxPrice || '',
      sort
    });
  } catch (error) {
    next(error);
  }
};

exports.seedProducts = async (req, res, next) => {
  try {
    const sampleProducts = [
      { name: 'Men Casual Shirt', price: 1999, category: 'Men', rating: 4.2, stock: 32, image: '/1.avif' },
      { name: 'Women Leather Bag', price: 3499, category: 'Women', rating: 4.7, stock: 12, image: '/3.avif' }
    ];

    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    res.send('Seeded!');
  } catch (error) {
    next(error);
  }
};