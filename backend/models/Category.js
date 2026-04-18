// models/Category.js — Schema cho danh mục sản phẩm

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,   // Không cho phép trùng tên danh mục
    trim: true
  },
  icon: {
    type: String,   // Emoji icon hiển thị trên frontend
    default: '📦'
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true   // false = ẩn danh mục (sản phẩm vẫn còn)
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
