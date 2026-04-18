// models/Review.js — Đánh giá sản phẩm (rating + comment)

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  userName:  { type: String, required: true },   // cache tên để không cần populate
  rating:    { type: Number, required: true, min: 1, max: 5 },
  comment:   { type: String, default: '' },
  isEdited:  { type: Boolean, default: false },
  editHistory: [
    {
      rating: Number,
      comment: String,
      editedAt: { type: Date, default: Date.now },
    }
  ]
}, { timestamps: true });

// Mỗi user chỉ được đánh giá 1 lần cho 1 sản phẩm
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
