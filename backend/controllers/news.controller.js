// controllers/news.controller.js — CRUD bài viết tin tức

const News = require('../models/News');

// ======================== LẤY DANH SÁCH BÀI VIẾT (PUBLIC) ========================
// GET /api/news?page=1&limit=9&category=Xu hướng&featured=true
const getNews = async (req, res) => {
  try {
    const page     = parseInt(req.query.page)  || 1;
    const limit    = parseInt(req.query.limit) || 9;
    const category = req.query.category || '';
    const featured = req.query.featured;   // 'true' → chỉ lấy bài nổi bật

    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;

    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      News.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      News.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        news,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ======================== LẤY CHI TIẾT 1 BÀI VIẾT (PUBLIC) ========================
// GET /api/news/:id
const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news || !news.isPublished) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }
    res.json({ success: true, data: news });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ======================== TẠO BÀI VIẾT (ADMIN) ========================
// POST /api/news
const createNews = async (req, res) => {
  try {
    const news = await News.create(req.body);
    res.status(201).json({ success: true, message: 'Tạo bài viết thành công', data: news });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ======================== CẬP NHẬT BÀI VIẾT (ADMIN) ========================
// PUT /api/news/:id
const updateNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!news) return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    res.json({ success: true, message: 'Cập nhật thành công', data: news });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ======================== XÓA BÀI VIẾT (ADMIN) ========================
// DELETE /api/news/:id
const deleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    res.json({ success: true, message: 'Đã xóa bài viết' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ======================== LẤY TẤT CẢ (ADMIN — kể cả bài ẩn) ========================
// GET /api/news/admin/all?page=1&limit=10&category=&search=
const getAllNewsAdmin = async (req, res) => {
  try {
    const page     = parseInt(req.query.page)  || 1;
    const limit    = parseInt(req.query.limit) || 10;
    const category = req.query.category || '';
    const search   = req.query.search?.trim() || '';

    const filter = {};
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      News.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      News.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { news, total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getNews, getNewsById, createNews, updateNews, deleteNews, getAllNewsAdmin };
