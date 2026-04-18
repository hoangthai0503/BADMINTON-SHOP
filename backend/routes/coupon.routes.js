// routes/coupon.routes.js

const express = require('express');
const router  = express.Router();
const { applyCoupon, getCoupons, createCoupon, deleteCoupon, getPublicCoupons } = require('../controllers/coupon.controller');
const auth    = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.post('/apply', auth, applyCoupon);           // user đăng nhập mới dùng được
router.get('/public', getPublicCoupons);            // Ai cũng xem được
router.get('/',       auth, isAdmin, getCoupons);
router.post('/',      auth, isAdmin, createCoupon);
router.delete('/:id', auth, isAdmin, deleteCoupon);

module.exports = router;
