// models/Product.js — Schema cho collection "products"

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0          // Giá không được âm
  },
  originalPrice: {
    type: Number,
    default: null,  // null = không có giảm giá, có giá trị = giá gốc bị gạch ngang
    min: 0
  },
  image: {
    type: String,   // Lưu URL ảnh, ví dụ: https://picsum.photos/400/300
    default: ''
  },
  category: {
    type: String,
    default: 'Khác'
  },
  stock: {
    type: Number,
    default: 0,
    min: 0          // Số lượng tồn kho không được âm
  },
  isActive: {
    type: Boolean,
    default: true   // true = đang bán, false = đã ẩn (xóa mềm)
                    // Dùng xóa mềm để Order cũ không bị mất tham chiếu
  },
  sold: {
    type: Number,
    default: 0
  },
  colors: {
    type: [String],
    default: []
  },
  sizes: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
