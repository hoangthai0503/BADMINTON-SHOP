// routes/auth.routes.js — Định nghĩa URL endpoints cho auth
// Cả register/login không cần middleware auth, nhưng forgot-password/reset-password cũng public

const express = require('express');
const router = express.Router();
const { register, login, adminLogin, updateProfile, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);   // chỉ dành cho admin
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/profile', auth, updateProfile);

module.exports = router;
