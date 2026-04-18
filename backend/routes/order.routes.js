// routes/order.routes.js — Tất cả order routes đều cần đăng nhập

const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, cancelOrder } = require('../controllers/order.controller');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.use(auth);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/all', isAdmin, getAllOrders);                  // chỉ admin, phải đặt trên /:id
router.get('/:id', getOrderById);
router.put('/:id/status', isAdmin, updateOrderStatus);     // chỉ admin
router.put('/:id/cancel', cancelOrder);                    // user tự hủy đơn pending

module.exports = router;
