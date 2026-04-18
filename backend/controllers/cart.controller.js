// controllers/cart.controller.js — Quản lý giỏ hàng
// Tất cả operations đều cần JWT (chỉ user đã đăng nhập mới có giỏ hàng)

const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ======================== XEM GIỎ HÀNG ========================
// GET /api/cart
const getCart = async (req, res) => {
  try {
    // req.user.userId được gắn bởi middleware auth.js
    let cart = await Cart.findOne({ userId: req.user.userId });
    // Tự tạo cart nếu chưa có (tránh 404 khi user mới)
    if (!cart) cart = await Cart.create({ userId: req.user.userId, items: [] });

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== THÊM VÀO GIỎ HÀNG ========================
// POST /api/cart/add
// Body: { productId, quantity }
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, color = null, size = null } = req.body;

    // Bước 1: Kiểm tra sản phẩm tồn tại và còn hàng
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Không đủ hàng trong kho'
      });
    }

    // Bước 2: Lấy giỏ hàng của user, tạo mới nếu chưa có
    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) cart = await Cart.create({ userId: req.user.userId, items: [] });

    // Bước 3: Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItem = cart.items.find(
      item => item.productId.toString() === productId && item.color === color && item.size === size
    );

    if (existingItem) {
      // Đã có → tăng số lượng
      existingItem.quantity += quantity;
    } else {
      // Chưa có → thêm item mới vào mảng, cache lại thông tin sản phẩm
      cart.items.push({
        productId: product._id,
        name: product.name,
        price: product.price,   // Cache giá hiện tại (có thể thay đổi nếu admin sửa)
        image: product.image,
        quantity,
        color,
        size
      });
    }

    await cart.save();

    res.json({ success: true, message: 'Đã thêm vào giỏ hàng', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== CẬP NHẬT SỐ LƯỢNG ========================
// PUT /api/cart/update
// Body: { productId, quantity }
const updateCart = async (req, res) => {
  try {
    const { productId, quantity, color = null, size = null } = req.body;

    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) cart = await Cart.create({ userId: req.user.userId, items: [] });
    const item = cart.items.find(i => i.productId.toString() === productId && i.color === color && i.size === size);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không có trong giỏ hàng'
      });
    }

    if (quantity <= 0) {
      // Số lượng về 0 → xóa item khỏi giỏ
      cart.items = cart.items.filter(i => !(i.productId.toString() === productId && i.color === color && i.size === size));
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json({ success: true, message: 'Đã cập nhật giỏ hàng', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== XÓA KHỎI GIỎ HÀNG ========================
// DELETE /api/cart/remove
// Body: { productId }
const removeFromCart = async (req, res) => {
  try {
    const { productId, color = null, size = null } = req.body;

    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) cart = await Cart.create({ userId: req.user.userId, items: [] });

    // Lọc ra tất cả items KHÁC productId + color + size cần xóa
    cart.items = cart.items.filter(
      item => !(item.productId.toString() === productId && item.color === color && item.size === size)
    );

    await cart.save();
    res.json({ success: true, message: 'Đã xóa khỏi giỏ hàng', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCart, removeFromCart };
