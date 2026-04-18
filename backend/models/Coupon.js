// models/Coupon.js — Mã giảm giá

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  code:         { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
  // percent: giảm X%, fixed: giảm X đồng
  value:        { type: Number, required: true, min: 0 },
  minOrder:     { type: Number, default: 0 },       // đơn tối thiểu mới áp dụng được
  maxDiscount:  { type: Number, default: null },     // giới hạn số tiền giảm tối đa (cho loại percent)
  
  // Advanced Conditions
  applicableCategories: { type: [String], default: [] }, // rỗng = áp dụng tất cả danh mục
  applicableProducts:   { type: [mongoose.Schema.Types.ObjectId], ref: 'Product', default: [] }, // rỗng = áp dụng mọi SP
  allowDiscounted:      { type: Boolean, default: true }, // nếu false, SP đang giảm giá trên hệ thống sẽ k được giảm thêm
  
  isActive:     { type: Boolean, default: true },
  expiresAt:    { type: Date, default: null },       // null = không hết hạn
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
