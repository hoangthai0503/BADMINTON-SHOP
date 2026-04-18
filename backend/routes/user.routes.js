// routes/user.routes.js — Routes quản lý user (admin only)

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const userController = require('../controllers/user.controller');

// Tất cả routes trong file này yêu cầu JWT + admin role

/**
 * GET /api/users
 * Lấy danh sách tất cả users (có phân trang & tìm kiếm)
 * Query params: page=1, limit=10, search=""
 */
router.get('/', auth, isAdmin, userController.getAllUsers);

/**
 * GET /api/users/:userId
 * Lấy thông tin chi tiết một user
 */
router.get('/:userId', auth, isAdmin, userController.getUserById);

/**
 * PUT /api/users/:userId/status
 * Cập nhật trạng thái (khóa/mở khóa) của user
 * Body: { isActive: true/false }
 */
router.put('/:userId/status', auth, isAdmin, userController.updateUserStatus);

/**
 * PUT /api/users/:userId/role
 * Cập nhật role của user
 * Body: { role: 'user' | 'admin' }
 */
router.put('/:userId/role', auth, isAdmin, userController.updateUserRole);

module.exports = router;
