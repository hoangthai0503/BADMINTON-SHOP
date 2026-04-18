// controllers/coupon.controller.js — Áp dụng và quản lý mã giảm giá

const Coupon = require('../models/Coupon');

// POST /api/coupons/apply — Kiểm tra và tính toán giảm giá
// Body: { code, orderTotal, items }
const applyCoupon = async (req, res) => {
  try {
    const { code, orderTotal, items = [] } = req.body;

    const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ' });
    }

    // Kiểm tra hết hạn
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết hạn' });
    }

    // Kiểm tra đơn tối thiểu
    if (orderTotal < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.minOrder)} mới áp dụng được mã này`
      });
    }

    // Xác định số tiền của các sản phẩm thoả mãn điều kiện
    let eligibleTotal = 0;
    
    // Nếu có truyền items, tính tổng tiền hợp lệ
    if (items && items.length > 0) {
      for (const item of items) {
        // Kiểm tra allowDiscounted (Nếu item.originalPrice khác null và khác price tức là đang giảm)
        let isDiscounted = item.originalPrice !== null && item.originalPrice > item.price;
        if (!coupon.allowDiscounted && isDiscounted) {
          continue; // Bỏ qua sản phẩm này
        }

        // Kiểm tra danh mục
        if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
          if (!coupon.applicableCategories.includes(item.category)) {
            continue;
          }
        }

        // Kiểm tra sản phẩm cụ thể
        if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
          const productIdsString = coupon.applicableProducts.map(id => id.toString());
          if (!productIdsString.includes(item.productId.toString())) {
            continue;
          }
        }

        eligibleTotal += (item.price * item.quantity);
      }
    } else {
      // Nếu không có items (để fallback an toàn), coi như tất cả hợp lệ (hoặc k hợp lệ tuỳ ý, nhưng nên là hợp lệ)
      eligibleTotal = orderTotal;
    }

    if (eligibleTotal === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mã giảm giá không áp dụng cho các sản phẩm trong giỏ hàng (do không đúng danh mục/sản phẩm hoặc là hàng đang sale).' 
      });
    }

    // Tính số tiền giảm dựa trên eligibleTotal
    let discount = 0;
    if (coupon.discountType === 'percent') {
      discount = Math.floor(eligibleTotal * coupon.value / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.value;
    }

    // Không giảm quá tổng đơn cũng như không qua total hợp lệ
    discount = Math.min(discount, eligibleTotal);
    discount = Math.min(discount, orderTotal);

    res.json({
      success: true,
      data: {
        code:         coupon.code,
        name:         coupon.name,
        discountType: coupon.discountType,
        value:        coupon.value,
        discount,                          // số tiền thực tế được giảm
        finalTotal:   orderTotal - discount,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/coupons — Admin xem danh sách (tuỳ chọn)
const getCoupons = async (_req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/coupons/public — Lấy các mã còn hiệu lực để public
const getPublicCoupons = async (_req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }]
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/coupons — Admin tạo mã mới
const createCoupon = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.code || payload.code.trim() === '') {
      payload.code = 'VCH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    const coupon = await Coupon.create(payload);
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/coupons/:id — Admin xóa mã
const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa mã giảm giá' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { applyCoupon, getCoupons, createCoupon, deleteCoupon, getPublicCoupons };
