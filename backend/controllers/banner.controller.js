// controllers/banner.controller.js — CRUD banner trang chủ

const Banner = require('../models/Banner');

// GET /api/banners — public, chỉ lấy banner đang active, sắp xếp theo order
const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/banners/admin/all — admin, lấy tất cả kể cả ẩn
const getAllBannersAdmin = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/banners — admin
const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, message: 'Tạo banner thành công', data: banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/banners/:id — admin
const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
    res.json({ success: true, message: 'Cập nhật thành công', data: banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/banners/:id — admin
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
    res.json({ success: true, message: 'Đã xóa banner' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBanners, getAllBannersAdmin, createBanner, updateBanner, deleteBanner };
