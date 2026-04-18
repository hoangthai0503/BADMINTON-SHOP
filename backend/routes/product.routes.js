// routes/product.routes.js — Định nghĩa URL cho product
// GET: public (ai cũng xem được)
// POST/PUT/DELETE: phải có JWT token VÀ phải là admin

const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product.controller');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Public routes — không cần đăng nhập
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin routes — chuỗi middleware: auth → isAdmin → controller
// Nếu auth fail: trả 401 | Nếu isAdmin fail: trả 403 | Qua hết: chạy controller
router.post('/', auth, isAdmin, createProduct);
router.put('/:id', auth, isAdmin, updateProduct);
router.delete('/:id', auth, isAdmin, deleteProduct);

module.exports = router;
