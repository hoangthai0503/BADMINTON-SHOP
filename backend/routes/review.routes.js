// routes/review.routes.js — Đánh giá sản phẩm
// GET public, POST cần đăng nhập

const express = require('express');
const router  = express.Router({ mergeParams: true }); // mergeParams để lấy :id từ product route
const { getReviews, getMyReview, createReview } = require('../controllers/review.controller');
const auth = require('../middleware/auth');

router.get('/',  getReviews);
router.get('/me', auth, getMyReview);
router.post('/', auth, createReview);

module.exports = router;
