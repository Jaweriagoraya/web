const express = require('express');
const publicController = require('../controllers/publicController');

const router = express.Router();

router.get('/', publicController.renderHome);
router.get('/products', publicController.renderProducts);
router.get('/seed-products', publicController.seedProducts);

module.exports = router;