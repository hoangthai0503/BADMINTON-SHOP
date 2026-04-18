// controllers/category.controller.js — CRUD danh mục sản phẩm

const Category = require('../models/Category');
const Product  = require('../models/Product');

// GET /api/categories — Lấy danh sách danh mục (public)
const getCategories = async (req, res) => {
  try {
    // Admin xem tất cả, user chỉ thấy danh mục đang hoạt động
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/categories — Tạo danh mục mới (admin)
const createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;

    // Kiểm tra trùng tên
    const exists = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Tên danh mục đã tồn tại' });
    }

    const category = await Category.create({ name, icon, description });
    res.status(201).json({ success: true, message: 'Tạo danh mục thành công', data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/categories/:id — Cập nhật danh mục (admin)
const updateCategory = async (req, res) => {
  try {
    const { name, icon, description, isActive } = req.body;

    // Kiểm tra trùng tên với danh mục khác
    if (name) {
      const exists = await Category.findOne({
        name: { $regex: `^${name}$`, $options: 'i' },
        _id: { $ne: req.params.id }
      });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Tên danh mục đã tồn tại' });
      }
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, icon, description, isActive },
      { new: true, runValidators: true }
    );

    if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });

    res.json({ success: true, message: 'Cập nhật thành công', data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/categories/:id — Xóa danh mục (admin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });

    // Kiểm tra còn sản phẩm đang dùng danh mục này không
    const productCount = await Product.countDocuments({ category: category.name, isActive: true });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa — còn ${productCount} sản phẩm đang dùng danh mục này`
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa danh mục' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
