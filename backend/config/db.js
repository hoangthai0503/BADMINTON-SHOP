// config/db.js — Kết nối MongoDB
// Nếu không có MONGODB_URI thật → dùng in-memory MongoDB + tự seed dữ liệu mẫu

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    let isDemo = false;

    // Phát hiện URI placeholder → chuyển sang chế độ demo
    if (!uri || uri.includes('<user>') || uri.includes('<pass>')) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      isDemo = true;
      console.log('⚡ Chế độ DEMO — MongoDB in-memory (dữ liệu mất khi tắt server)');
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB đã kết nối: ${conn.connection.host}`);

    // Nếu là demo, tự động seed dữ liệu mẫu
    if (isDemo) {
      await seedDemoData();
    }
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error.message);
    process.exit(1);
  }
};

// Seed dữ liệu mẫu cho chế độ demo
const seedDemoData = async () => {
  const User = require('../models/User');
  const Product = require('../models/Product');
  const Cart = require('../models/Cart');
  const bcrypt = require('bcryptjs');

  // Tạo tài khoản admin
  const adminPass = await bcrypt.hash('admin123', 10);
  const admin = await User.create({ name: 'Admin', email: 'admin@shop.com', password: adminPass, role: 'admin' });
  await Cart.create({ userId: admin._id, items: [] });

  // Tạo tài khoản user thường
  const userPass = await bcrypt.hash('user123', 10);
  const user = await User.create({ name: 'Nguyễn Văn A', email: 'user@shop.com', password: userPass, role: 'user' });
  await Cart.create({ userId: user._id, items: [] });

  // Tạo sản phẩm mẫu với ID cố định — tránh lỗi 404 khi restart server
  const mongoose = require('mongoose');
  await Product.insertMany([
    { _id: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'), name: 'Áo thun basic nam', description: 'Cotton 100%, thoáng mát, co giãn 4 chiều', price: 199000, image: 'https://picsum.photos/seed/p1/400/400', category: 'Thời trang', stock: 50 },
    { _id: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaab'), name: 'Quần jeans slim fit', description: 'Dáng slim, vải denim cao cấp', price: 450000, image: 'https://picsum.photos/seed/p2/400/400', category: 'Thời trang', stock: 30 },
    { _id: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaac'), name: 'Giày sneaker trắng', description: 'Unisex, đế cao su chống trượt', price: 650000, image: 'https://picsum.photos/seed/p3/400/400', category: 'Giày dép', stock: 25 },
    { _id: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaad'), name: 'Túi tote canvas', description: 'Vải canvas đa năng, chịu tải tốt', price: 180000, image: 'https://picsum.photos/seed/p4/400/400', category: 'Phụ kiện', stock: 40 },
    { _id: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaae'), name: 'Tai nghe bluetooth', description: 'Không dây, pin 20h, chống ồn chủ động', price: 890000, image: 'https://picsum.photos/seed/p5/400/400', category: 'Điện tử', stock: 15 },
    { _id: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaf'), name: 'Đồng hồ thông minh', description: 'Theo dõi sức khỏe, chống nước IP67', price: 1200000, image: 'https://picsum.photos/seed/p6/400/400', category: 'Điện tử', stock: 10 },
    { _id: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaab0'), name: 'Bình nước giữ nhiệt', description: 'Giữ nóng 12h, lạnh 24h, 500ml', price: 280000, image: 'https://picsum.photos/seed/p7/400/400', category: 'Gia dụng', stock: 60 },
    { _id: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaab1'), name: 'Đèn bàn LED', description: 'Chống mỏi mắt, điều chỉnh độ sáng', price: 320000, image: 'https://picsum.photos/seed/p8/400/400', category: 'Gia dụng', stock: 20 },
    { _id: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaab2'), name: 'Sách Tư duy nhanh và chậm', description: 'Bestseller tâm lý học của Daniel Kahneman', price: 120000, image: 'https://picsum.photos/seed/p9/400/400', category: 'Sách', stock: 35 },
    { _id: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaab3'), name: 'Bộ bút màu 36 cái', description: 'Màu sắc tươi sáng, chuyên nghiệp', price: 95000, image: 'https://picsum.photos/seed/p10/400/400', category: 'Văn phòng phẩm', stock: 45 },
    { _id: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaab4'), name: 'Áo khoác dù nhẹ', description: 'Chống nước, gấp gọn bỏ túi', price: 380000, image: 'https://picsum.photos/seed/p11/400/400', category: 'Thời trang', stock: 28 },
    { _id: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaab5'), name: 'Chuột không dây', description: 'USB Nano, pin dùng 18 tháng', price: 250000, image: 'https://picsum.photos/seed/p12/400/400', category: 'Điện tử', stock: 33 },
  ]);

  console.log('🌱 Đã seed dữ liệu demo:');
  console.log('   👤 admin@shop.com / admin123');
  console.log('   👤 user@shop.com  / user123');
  console.log('   📦 12 sản phẩm mẫu');
};

module.exports = connectDB;
