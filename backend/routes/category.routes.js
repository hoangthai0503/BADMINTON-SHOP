// routes/category.routes.js — Routes danh mục sản phẩm

const express = require('express');
const router  = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const auth    = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.get('/', getCategories);                              // public
router.post('/', auth, isAdmin, createCategory);            // admin
router.put('/:id', auth, isAdmin, updateCategory);          // admin
router.delete('/:id', auth, isAdmin, deleteCategory);       // admin

module.exports = router;
