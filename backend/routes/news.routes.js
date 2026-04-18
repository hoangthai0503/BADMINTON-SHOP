// routes/news.routes.js — Routes cho tin tức / blog

const express = require('express');
const router  = express.Router();
const {
  getNews, getNewsById, createNews, updateNews, deleteNews, getAllNewsAdmin,
} = require('../controllers/news.controller');
const auth    = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Admin only — phải đặt TRƯỚC /:id để không bị match nhầm
router.get('/admin/all', auth, isAdmin, getAllNewsAdmin);
router.post('/', auth, isAdmin, createNews);
router.put('/:id', auth, isAdmin, updateNews);
router.delete('/:id', auth, isAdmin, deleteNews);

// Public — ai cũng xem được (đặt sau để /admin/all không bị /:id nuốt)
router.get('/', getNews);
router.get('/:id', getNewsById);

module.exports = router;
