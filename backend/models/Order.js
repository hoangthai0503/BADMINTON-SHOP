// models/Order.js — Schema cho collection "orders"
// Order lưu SNAPSHOT đầy đủ tại thời điểm mua: tên, giá, ảnh KHÔNG thay đổi sau này
// Lý do: nếu admin đổi giá sản phẩm sau, order cũ vẫn giữ đúng giá đã mua

const mongoose = require('mongoose');

// Sub-schema cho từng item trong đơn hàng
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
    // Không required vì sản phẩm có thể bị xóa sau này, đơn hàng vẫn phải tồn tại
  },
  name: String,     // SNAPSHOT — giá trị tại thời điểm checkout, không bao giờ thay đổi
  price: Number,    // SNAPSHOT — giá tại thời điểm mua (không phải giá hiện tại)
  image: String,    // SNAPSHOT
  quantity: Number,
  color: { type: String, default: null },
  size: { type: String, default: null }
}, {
  _id: false
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    default: 'CREATED',
    enum: ['CREATED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
  },
  paymentStatus: {
    type: String,
    default: 'PENDING',
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED']
  },
  shippingAddress: { type: String, required: true },
  paymentMethod: {
    type: String,
    default: 'cod',
    enum: ['cod', 'bank_transfer']
    // cod: thanh toán tiền mặt khi nhận hàng
    // bank_transfer: chuyển khoản ngân hàng
  },
  discount:        { type: Number, default: 0 },   // số tiền đã giảm
  couponCode:      { type: String, default: null }, // mã coupon đã dùng
}, {
  timestamps: true  // createdAt = ngày đặt hàng
});

module.exports = mongoose.model('Order', orderSchema);
