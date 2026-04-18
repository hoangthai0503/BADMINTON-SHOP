// server.js — Điểm khởi động của ứng dụng backend
// Khởi tạo Express, kết nối DB, đăng ký routes

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Nạp biến môi trường từ file .env
dotenv.config();

// Kết nối MongoDB
connectDB();

const app = express();

// Middleware: chỉ cho phép frontend đúng domain gọi API
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:4173',  // vite preview
];
app.use(cors({
  origin: (origin, callback) => {
    // Cho phép request không có origin (Postman, mobile app)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS: origin không được phép'));
  },
  credentials: true,
}));
app.use(express.json());

// Serve ảnh tĩnh từ folder uploads
// Truy cập: http://localhost:5000/uploads/ten-anh.jpg
app.use('/uploads', require('express').static(require('path').join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/products/:id/reviews', require('./routes/review.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/coupons', require('./routes/coupon.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/news', require('./routes/news.routes'));
app.use('/api/banners', require('./routes/banner.routes'));

// Route kiểm tra server hoạt động
app.get('/', (req, res) => {
  res.json({ success: true, message: 'E-commerce API đang chạy' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`🛒 Frontend:    http://localhost:5173`);
  console.log(`⚙️  Admin panel: http://localhost:5173/admin/login`);
  console.log(`📦 API:         http://localhost:${PORT}/api\n`);
});
