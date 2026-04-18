// models/Cart.js — Schema cho collection "carts"
// Mỗi user CHỈ có đúng 1 cart (userId unique)
// Cart cache lại name, price, image để hiển thị nhanh mà không cần query Product

const mongoose = require('mongoose');

// Sub-schema cho từng item trong giỏ hàng
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,  // Tham chiếu đến collection products
    ref: 'Product',
    required: true
  },
  name: String,     // Cache tên sản phẩm để hiển thị không cần join
  price: Number,    // Cache giá — chỉ để hiển thị, khi checkout sẽ lấy giá mới từ Product
  image: String,    // Cache URL ảnh
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  color: {
    type: String,
    default: null
  },
  size: {
    type: String,
    default: null
  }
}, {
  _id: false        // Không tạo _id riêng cho mỗi item, tiết kiệm bộ nhớ
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,   // Ràng buộc: mỗi user chỉ có đúng 1 cart
    required: true
  },
  items: [cartItemSchema]   // Mảng các sản phẩm trong giỏ
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
