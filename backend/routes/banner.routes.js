// routes/banner.routes.js
const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Public
router.get('/', bannerController.getBanners);

// Admin
router.get('/admin/all', auth, isAdmin, bannerController.getAllBannersAdmin);
router.post('/', auth, isAdmin, bannerController.createBanner);
router.put('/:id', auth, isAdmin, bannerController.updateBanner);
router.delete('/:id', auth, isAdmin, bannerController.deleteBanner);

module.exports = router;
