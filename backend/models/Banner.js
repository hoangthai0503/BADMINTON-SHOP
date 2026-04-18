// models/Banner.js — Schema quản lý banner trang chủ

const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  tag:      { type: String, default: '🔥 FLASH SALE' },
  title:    { type: String, required: true },        // Hỗ trợ \n để xuống dòng
  sub:      { type: String, default: '' },           // Dòng phụ dưới tiêu đề
  cta:      { type: String, default: 'Mua ngay' },   // Text nút CTA
  ctaLink:  { type: String, default: '/products' },  // URL khi bấm nút CTA
  ctaColor: { type: String, default: '#e94560' },    // Màu nút CTA (hex)
  bg:       { type: String, default: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)' }, // CSS background
  image:    { type: String, default: '' },           // Ảnh minh họa bên phải
  order:    { type: Number, default: 0 },            // Thứ tự hiển thị
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Banner', bannerSchema);
