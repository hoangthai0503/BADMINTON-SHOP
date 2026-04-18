// models/User.js — Schema cho collection "users" trong MongoDB
// Mongoose tự tạo collection tên "users" (viết thường, số nhiều của "User")

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['nam', 'nu', 'khac'],
    default: 'khac'
  },
  dob: {
    type: Date,
    default: null
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true,
    unique: true    // Không cho phép 2 user trùng email, Mongoose tự tạo index unique
  },
  password: {
    type: String,
    required: true
    // Lưu password đã hash bằng bcrypt, KHÔNG bao giờ lưu plaintext
  },
  role: {
    type: String,
    default: 'user'   // Mặc định là 'user', chỉ sửa thủ công trong DB để lên 'admin'
  },
  isActive: {
    type: Boolean,
    default: true     // true = tài khoản đang hoạt động, false = bộ khóa
  },
  resetPasswordToken: {
    type: String,
    default: null     // Token được gửi khi user quên mật khẩu
  },
  resetPasswordExpires: {
    type: Date,
    default: null     // Thời hạn của token (mặc định 1 giờ)
  }
}, {
  timestamps: true  // Tự động thêm createdAt và updatedAt vào mỗi document
});

module.exports = mongoose.model('User', userSchema);
