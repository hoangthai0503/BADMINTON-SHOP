// controllers/user.controller.js — Quản lý user (admin only)

const User = require('../models/User');
const Order = require('../models/Order');

/**
 * GET /api/users
 * Lấy danh sách tất cả users (có phân trang)
 * Query params: page, limit, search
 */
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    // Tìm kiếm theo tên hoặc email (case-insensitive)
    const query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('_id name email role isActive createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      message: 'Lấy danh sách users thành công',
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          usersPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách users:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách users',
      error: error.message
    });
  }
};

/**
 * GET /api/users/:userId
 * Lấy thông tin chi tiết một user + số lượng đơn hàng của họ
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User không tồn tại'
      });
    }

    // Lấy số lượng đơn hàng của user này
    const orderCount = await Order.countDocuments({ userId });

    res.json({
      success: true,
      message: 'Lấy thông tin user thành công',
      data: {
        user,
        orderCount
      }
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin user',
      error: error.message
    });
  }
};

/**
 * PUT /api/users/:userId/status
 * Cập nhật trạng thái hoạt động của user (khóa/mở khóa)
 * Body: { isActive: boolean }
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive phải là boolean'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('_id name email role isActive');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User không tồn tại'
      });
    }

    const status = isActive ? 'mở khóa' : 'khóa';
    res.json({
      success: true,
      message: `${status.toUpperCase()} tài khoản user thành công`,
      data: user
    });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật trạng thái user',
      error: error.message
    });
  }
};

/**
 * PUT /api/users/:userId/role
 * Cập nhật role của user (user/admin)
 * Body: { role: 'user' | 'admin' }
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Kiểm tra role hợp lệ
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role phải là "user" hoặc "admin"'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('_id name email role isActive');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User không tồn tại'
      });
    }

    res.json({
      success: true,
      message: `Cập nhật role thành "${role}" thành công`,
      data: user
    });
  } catch (error) {
    console.error('Lỗi cập nhật role user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật role user',
      error: error.message
    });
  }
};
