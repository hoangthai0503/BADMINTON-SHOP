// controllers/auth.controller.js — Xử lý đăng ký, đăng nhập, reset password

const User = require('../models/User');
const Cart = require('../models/Cart');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendResetPasswordEmail, sendWelcomeEmail } = require('../utils/sendEmail');

// ======================== ĐĂNG KÝ ========================
// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Bước 1: Chặn đăng ký nếu tên hoặc email chứa chữ "admin"
    if (name.toLowerCase().includes('admin') || email.toLowerCase().includes('admin')) {
      return res.status(400).json({ success: false, message: 'Tên hoặc email không hợp lệ' });
    }

    // Bước 2: Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Bước 2: Hash password trước khi lưu vào DB
    // saltRounds = 10: độ phức tạp của hash, bcrypt tự thêm salt ngẫu nhiên
    // Không bao giờ lưu plaintext password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Bước 3: Tạo user mới
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user'  // Mặc định là user, không cho phép tự đặt role admin
    });

    // Bước 4: Tạo Cart rỗng cho user mới ngay lập tức
    // Mỗi user có đúng 1 cart, tạo luôn để sau không cần kiểm tra tồn tại
    await Cart.create({ userId: user._id, items: [] });

    // Bước 5: Gửi email chào mừng (không await — không chặn response nếu email lỗi)
    sendWelcomeEmail({ toEmail: user.email, userName: user.name });

    // Bước 5: Ký JWT token
    // jwt.sign(payload, secret, options)
    // payload: dữ liệu encode vào token — không đưa password vào đây
    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }  // Hết hạn sau 7 ngày
    );

    // Bước 6: Trả về token và thông tin user (không trả password)
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          gender: user.gender,
          dob: user.dob
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== ĐĂNG NHẬP ========================
// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Bước 1: Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // Chặn tuyệt đối: role admin HOẶC tên/email chứa chữ "admin" (không phân biệt hoa thường)
    const isAdminAccount =
      user.role === 'admin' ||
      user.name.toLowerCase().includes('admin') ||
      user.email.toLowerCase().includes('admin');
    if (isAdminAccount) {
      return res.status(403).json({ success: false, message: 'Tài khoản không hợp lệ' });
    }

    // Bước 2: So sánh password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // Bước 3: Ký JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, gender: user.gender, dob: user.dob }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== ĐĂNG NHẬP ADMIN ========================
// POST /api/auth/admin-login — chỉ dành cho tài khoản admin
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // Chặn user thường dùng endpoint này
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Tài khoản không có quyền admin' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, gender: user.gender, dob: user.dob }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== CẬP NHẬT THÔNG TIN CÁ NHÂN ========================
// PUT /api/auth/profile — cần đăng nhập
const updateProfile = async (req, res) => {
  try {
    const { name, phone, gender, dob, oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;

    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    res.json({ success: true, message: 'Cập nhật thành công', data: { name: user.name, email: user.email, phone: user.phone, gender: user.gender, dob: user.dob } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ======================== QUÊN MẬT KHẨU ========================
// POST /api/auth/forgot-password
// Body: { email }
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      // Không nói rõ "email không tồn tại" để tránh lộ thông tin
      return res.status(200).json({
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, chúng tôi sẽ gửi link reset password'
      });
    }

    // Tạo reset token (ngẫu nhiên, 32 bytes)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Lưu token và thời hạn (1 giờ) vào user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ nữa
    await user.save();

    // Gửi email với link reset password
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    await sendResetPasswordEmail({
      toEmail: user.email,
      userName: user.name,
      resetLink
    });

    res.json({
      success: true,
      message: 'Nếu email tồn tại trong hệ thống, chúng tôi sẽ gửi link reset password'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== ĐẶT LẠI MẬT KHẨU ========================
// POST /api/auth/reset-password
// Body: { token, newPassword }
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token và mật khẩu mới là bắt buộc'
      });
    }

    // Tìm user với token này và chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }  // Lớn hơn thời gian hiện tại = chưa hết hạn
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Link reset password không hợp lệ hoặc đã hết hạn'
      });
    }

    // Hash password mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật password và xóa reset token
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, adminLogin, updateProfile, forgotPassword, resetPassword };
