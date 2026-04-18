// models/News.js — Schema bài viết tin tức / blog

const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  summary: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    default: '',  // Nội dung đầy đủ (có thể để trống cho bản demo)
  },
  image: {
    type: String,
    default: '',
  },
  category: {
    type: [String],
    default: ['Xu hướng'],
  },
  readTime: {
    type: String,
    default: '3 phút đọc',
  },
  isFeatured: {
    type: Boolean,
    default: false,   // Bài nổi bật hiển thị to ở đầu trang tin tức
  },
  isPublished: {
    type: Boolean,
    default: true,    // false = ẩn khỏi người dùng
  },
  couponCode: {
    type: String,     // Mã voucher liên kết (tùy chọn)
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('News', newsSchema);
