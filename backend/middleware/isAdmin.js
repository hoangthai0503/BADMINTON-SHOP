// middleware/isAdmin.js — Kiểm tra user có phải admin không
// PHẢI dùng SAU middleware auth.js vì cần req.user đã được gắn sẵn
// Thứ tự trong route: auth → isAdmin → controller

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền thực hiện thao tác này'
      // 403 Forbidden: có token hợp lệ nhưng không đủ quyền
      // Khác với 401 Unauthorized: không có hoặc sai token
    });
  }
  next();
};

module.exports = isAdmin;
