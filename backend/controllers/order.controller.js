// controllers/order.controller.js — Đặt hàng và xem lịch sử đơn hàng

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const { sendOrderConfirmEmail } = require('../utils/sendEmail');

// ======================== ĐẶT HÀNG (CHECKOUT) ========================
// POST /api/orders
// Body: { shippingAddress, couponCode, paymentMethod }
// paymentMethod: 'cod' (thanh toán tiền mặt) | 'bank_transfer' (chuyển khoản)
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, couponCode, paymentMethod } = req.body;

  // Bước 1: Lấy giỏ hàng hiện tại của user
  const cart = await Cart.findOne({ userId: req.user.userId });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Giỏ hàng trống, không thể đặt hàng'
    });
  }

  // Bước 2: Với mỗi item trong cart, query lại Product để lấy giá MỚI NHẤT
  // KHÔNG dùng giá cache trong Cart vì admin có thể đã thay đổi giá
  const snapshotItems = [];
  let totalPrice = 0;

  for (const cartItem of cart.items) {
    const product = await Product.findById(cartItem.productId);

    if (!product || !product.isActive) {
      return res.status(400).json({
        success: false,
        message: `Sản phẩm "${cartItem.name}" hiện không còn bán`
      });
    }

    // Kiểm tra tồn kho đủ không
    if (product.stock < cartItem.quantity) {
      return res.status(400).json({
        success: false,
        message: `Sản phẩm "${product.name}" chỉ còn ${product.stock} cái trong kho`
      });
    }

    // Build snapshot: lưu giá trị tại đúng thời điểm này, sẽ không thay đổi
    snapshotItems.push({
      productId: product._id,
      name: product.name,       // Từ Product — không từ Cart
      price: product.price,     // Giá MỚI NHẤT từ Product
      image: product.image,
      quantity: cartItem.quantity,
      color: cartItem.color,
      size: cartItem.size
    });

    // Tính tổng từ giá mới nhất (không phải giá cache trong cart)
    totalPrice += product.price * cartItem.quantity;
  }

  // Bước 3: Áp dụng coupon nếu có
  let discount = 0;
  let couponApplied = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && (!coupon.expiresAt || new Date() <= coupon.expiresAt) && totalPrice >= coupon.minOrder) {
      discount = coupon.discountType === 'percent'
        ? Math.min(Math.floor(totalPrice * coupon.value / 100), coupon.maxDiscount || Infinity)
        : coupon.value;
      discount = Math.min(discount, totalPrice);
      couponApplied = coupon.code;
    }
  }

  // Bước 4: Tạo Order với snapshot data
  const order = await Order.create({
    userId: req.user.userId,
    items: snapshotItems,
    totalPrice: totalPrice - discount,
    discount,
    couponCode: couponApplied,
    shippingAddress,
    paymentMethod: paymentMethod || 'cod',
    orderStatus: 'CREATED',
    paymentStatus: 'PENDING'
  });

  // Bước 5: Trừ tồn kho và cộng dồn số lượng đã bán — dùng $inc để atomic, tránh race condition
  for (const item of snapshotItems) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity, sold: item.quantity } });
  }

  // Bước 6: Xóa sạch giỏ hàng sau khi đặt hàng thành công
  cart.items = [];
  await cart.save();

  // Bước 5: Gửi email xác nhận — không await để không làm chậm response
  User.findById(req.user.userId).then(user => {
    if (user) {
      sendOrderConfirmEmail({
        toEmail: user.email,
        userName: user.name,
        order,
      });
    }
  });

  res.status(201).json({
    success: true,
    message: 'Đặt hàng thành công',
    data: order
  });
} catch (error) {
  res.status(500).json({ success: false, message: error.message });
}
};

// ======================== XEM LỊCH SỬ ĐƠN HÀNG ========================
// GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    // Lấy tất cả orders của user, sắp xếp mới nhất trước
    const orders = await Order.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });  // -1 = giảm dần theo thời gian = mới nhất trước

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== XEM CHI TIẾT 1 ĐƠN HÀNG ========================
// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Chỉ cho xem đơn của chính mình (trừ admin)
    if (order.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem đơn hàng này' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (ADMIN) ========================
// PUT /api/orders/:id/status
// Body: { status: 'pending' | 'paid' | 'cancelled' }
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const validOrderStatuses = ['CREATED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    const validPaymentStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: 'Trạng thái đơn hàng không hợp lệ' });
    }
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Trạng thái thanh toán không hợp lệ' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Nếu chuyển sang CANCELLED → hoàn lại tồn kho
    if (orderStatus === 'CANCELLED' && order.orderStatus !== 'CANCELLED') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
      }
    }

    // Nếu từ CANCELLED chuyển lại trạng thái khác → trừ kho lại
    if (order.orderStatus === 'CANCELLED' && orderStatus && orderStatus !== 'CANCELLED') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
      }
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save();

    res.json({ success: true, message: 'Cập nhật thành công', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== XEM TẤT CẢ ĐƠN HÀNG (ADMIN) ========================
// GET /api/orders/all — chỉ admin mới gọi được
// Query params: page, limit, status, search (mã đơn hoặc email)
const getAllOrders = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const orderStatus = req.query.orderStatus || '';
    const paymentStatus = req.query.paymentStatus || '';
    const search = req.query.search?.trim() || '';

    const filter = {};
    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    const skip = (page - 1) * limit;

    // Tìm theo email: lookup user trước, lấy userId
    let userIdFilter = null;
    if (search) {
      const User = require('../models/User');
      const matchedUsers = await User.find({
        email: { $regex: search, $options: 'i' }
      }).select('_id');
      if (matchedUsers.length > 0) {
        userIdFilter = matchedUsers.map(u => u._id);
      }
    }

    // Tìm theo mã đơn (8 ký tự cuối của _id) hoặc email user
    if (search) {
      const orConditions = [];
      // Mã đơn: lấy tất cả order rồi filter (MongoDB không hỗ trợ slice trên _id trực tiếp)
      // Dùng regex trên string của _id
      if (search.length <= 8) {
        // Tìm order có _id kết thúc bằng search (case-insensitive)
        const allOrders = await Order.find(filter).select('_id');
        const matchedIds = allOrders
          .filter(o => o._id.toString().slice(-8).toLowerCase().includes(search.toLowerCase()))
          .map(o => o._id);
        if (matchedIds.length > 0) orConditions.push({ _id: { $in: matchedIds } });
      }
      if (userIdFilter) orConditions.push({ userId: { $in: userIdFilter } });

      if (orConditions.length > 0) {
        filter.$or = orConditions;
      } else if (!userIdFilter) {
        // Không tìm thấy gì → trả về rỗng
        return res.json({ success: true, data: { orders: [], total: 0, page: 1, totalPages: 0 } });
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== USER TỰ HỦY ĐƠN HÀNG ========================
// PUT /api/orders/:id/cancel
// Chỉ cho hủy khi status = 'pending', và đúng chủ đơn hàng
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Chỉ được hủy đơn của chính mình
    if (order.userId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền hủy đơn hàng này' });
    }

    // Chỉ được hủy khi đơn đang ở trạng thái CREATED hoặc CONFIRMED
    if (order.orderStatus !== 'CREATED' && order.orderStatus !== 'CONFIRMED') {
      return res.status(400).json({ success: false, message: 'Chỉ có thể hủy đơn hàng khi chưa xử lý' });
    }

    // Hoàn lại tồn kho cho từng sản phẩm
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }

    order.orderStatus = 'CANCELLED';
    await order.save();

    res.json({ success: true, message: 'Hủy đơn hàng thành công', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, cancelOrder };
