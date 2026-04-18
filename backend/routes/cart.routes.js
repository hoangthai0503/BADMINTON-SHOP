// routes/cart.routes.js — Tất cả cart routes đều cần đăng nhập

const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCart, removeFromCart } = require('../controllers/cart.controller');
const auth = require('../middleware/auth');

// Áp dụng auth cho toàn bộ router — thay vì viết auth ở từng route
router.use(auth);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCart);
router.delete('/remove', removeFromCart);

module.exports = router;
