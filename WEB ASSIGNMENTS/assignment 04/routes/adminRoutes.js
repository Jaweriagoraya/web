const express = require('express');
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/login', adminController.renderLogin);
router.post('/login', adminController.login);
router.get('/logout', adminController.logout);
router.get('/', isAdmin, adminController.renderDashboard);
router.get('/profile', isAdmin, adminController.renderProfile);
router.get('/add', isAdmin, adminController.renderAddProduct);
router.post('/add', isAdmin, upload.single('image'), adminController.addProduct);
router.get('/edit/:id', isAdmin, adminController.renderEditProduct);
router.put('/edit/:id', isAdmin, upload.single('image'), adminController.updateProduct);
router.delete('/delete/:id', isAdmin, adminController.deleteProduct);

module.exports = router;