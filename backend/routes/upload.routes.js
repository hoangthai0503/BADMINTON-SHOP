// routes/upload.routes.js — Upload ảnh sản phẩm
// POST /api/upload — Chỉ admin mới được upload, giới hạn 5MB, chỉ nhận file ảnh

const express  = require('express');
const router   = express.Router();
const path     = require('path');
const multer   = require('multer');
const auth     = require('../middleware/auth');
const isAdmin  = require('../middleware/isAdmin');

// Cấu hình nơi lưu file và tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Lưu vào thư mục backend/uploads/
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Tên file: product-1712345678901.jpg (timestamp để tránh trùng)
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${Date.now()}${ext}`);
  },
});

// Chỉ chấp nhận file ảnh (jpg, png, webp, gif...)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp...)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Tối đa 5MB
});

// POST /api/upload
// Middleware: auth → isAdmin → multer → handler
router.post('/', auth, isAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Không có file ảnh' });
  }

  // Tạo URL đầy đủ để frontend dùng làm src của <img>
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.json({
    success: true,
    message: 'Upload ảnh thành công',
    data: { url: imageUrl, filename: req.file.filename },
  });
});

module.exports = router;
