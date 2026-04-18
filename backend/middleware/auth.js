// middleware/auth.js — Kiểm tra JWT token trong mọi request cần xác thực
// Middleware chạy TRƯỚC controller, giống "bảo vệ cửa"
// Nếu token hợp lệ → gắn req.user và cho đi tiếp (next())
// Nếu không → trả lỗi 401 ngay, không chạy vào controller

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  // Bước 1: Lấy token từ header Authorization
  // Header có dạng: "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
  const authHeader = req.headers['authorization'];

  // Không có header hoặc không bắt đầu bằng "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Không có token, từ chối truy cập'
    });
  }

  // Bước 2: Tách token ra khỏi chuỗi "Bearer "
  // "Bearer abc123..." → split(' ')[1] → "abc123..."
  const token = authHeader.split(' ')[1];

  try {
    // Bước 3: Verify token bằng JWT_SECRET
    // Nếu hợp lệ: trả về payload đã encode khi tạo token
    // Nếu sai chữ ký hoặc hết hạn: throw error → chạy vào catch
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Bước 4: Kiểm tra xem user có bị khóa hay không
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User không tồn tại'
      });
    }

    // Kiểm tra isActive status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ administrator'
      });
    }

    // Bước 5: Gắn thông tin user vào request để controller sử dụng
    // Dùng role từ DB (user.role) thay vì từ token (decoded.role)
    // Lý do: nếu role thay đổi trong DB, không cần chờ token hết hạn mới có hiệu lực
    req.user = {
      userId: decoded.userId,
      role: user.role,       // ← từ DB, luôn cập nhật
      name: user.name,
    };

    // Bước 6: Chuyển sang middleware/controller tiếp theo
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn'
    });
  }
};

module.exports = auth;
