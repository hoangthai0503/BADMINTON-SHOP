// controllers/review.controller.js — Đánh giá sản phẩm

const Review  = require('../models/Review');
const Order   = require('../models/Order');

// GET /api/products/:id/reviews — Lấy tất cả đánh giá của 1 sản phẩm (public)
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.id })
      .sort({ createdAt: -1 });

    // Tính điểm trung bình
    const avg = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ success: true, data: { reviews, avg: Number(avg), total: reviews.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id/reviews/me — Lấy đánh giá của tôi cho sản phẩm này
const getMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({ productId: req.params.id, userId: req.user.userId });
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products/:id/reviews — Gửi đánh giá (cần đăng nhập + đã mua hàng)
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId    = req.user.userId;

    // Kiểm tra user có đơn hàng "paid" chưa
    const hasBought = await Order.findOne({
      userId,
      'items.productId': productId,
      status: 'paid',
    });
    if (!hasBought) {
      return res.status(403).json({ success: false, message: 'Bạn cần thanh toán đơn hàng trước khi đánh giá' });
    }

    const existingReview = await Review.findOne({ productId, userId });
    
    let review;
    if (existingReview) {
      // Check 7-day edit limit
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - existingReview.createdAt.getTime() > sevenDaysInMs) {
        return res.status(403).json({ success: false, message: 'Đã quá hạn 7 ngày để chỉnh sửa đánh giá này' });
      }

      // Add to edit history
      existingReview.editHistory.push({
        rating: existingReview.rating,
        comment: existingReview.comment,
      });

      // Update values
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.isEdited = true;
      existingReview.userName = req.user.name; // In case name changed

      review = await existingReview.save();
    } else {
      // Create new review
      review = await Review.create({
        productId,
        userId,
        userName: req.user.name,
        rating,
        comment,
      });
    }

    res.status(201).json({ success: true, message: existingReview ? 'Đã cập nhật đánh giá!' : 'Cảm ơn bạn đã đánh giá!', data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getReviews, getMyReview, createReview };
