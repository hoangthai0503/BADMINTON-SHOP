// seed.js — Tạo dữ liệu mẫu: 1 admin, 1 user, 12 sản phẩm
// Chạy: node seed.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');

const products = [
  { name: 'Áo thun basic nam', description: 'Áo thun cotton 100%, thoáng mát, co giãn 4 chiều', price: 199000, image: 'https://picsum.photos/seed/ao1/400/400', category: 'Thời trang', stock: 50 },
  { name: 'Quần jeans slim fit', description: 'Quần jeans nam dáng slim, vải denim cao cấp', price: 450000, image: 'https://picsum.photos/seed/quan1/400/400', category: 'Thời trang', stock: 30 },
  { name: 'Giày sneaker trắng', description: 'Giày thể thao unisex, đế cao su chống trượt', price: 650000, image: 'https://picsum.photos/seed/giay1/400/400', category: 'Giày dép', stock: 25 },
  { name: 'Túi tote canvas', description: 'Túi vải canvas đa năng, chịu tải tốt', price: 180000, image: 'https://picsum.photos/seed/tui1/400/400', category: 'Phụ kiện', stock: 40 },
  { name: 'Tai nghe bluetooth', description: 'Tai nghe không dây, pin 20h, chống ồn chủ động', price: 890000, image: 'https://picsum.photos/seed/tai1/400/400', category: 'Điện tử', stock: 15 },
  { name: 'Đồng hồ thông minh', description: 'Smartwatch theo dõi sức khỏe, IP67', price: 1200000, image: 'https://picsum.photos/seed/dong1/400/400', category: 'Điện tử', stock: 10 },
  { name: 'Bình nước giữ nhiệt', description: 'Giữ nóng 12h, lạnh 24h, dung tích 500ml', price: 280000, image: 'https://picsum.photos/seed/binh1/400/400', category: 'Gia dụng', stock: 60 },
  { name: 'Đèn bàn LED', description: 'Đèn học chống mỏi mắt, điều chỉnh độ sáng', price: 320000, image: 'https://picsum.photos/seed/den1/400/400', category: 'Gia dụng', stock: 20 },
  { name: 'Sách "Tư duy nhanh và chậm"', description: 'Bestseller về tâm lý học hành vi của Daniel Kahneman', price: 120000, image: 'https://picsum.photos/seed/sach1/400/400', category: 'Sách', stock: 35 },
  { name: 'Bộ bút màu 36 cái', description: 'Bút màu chuyên nghiệp, màu sắc tươi sáng', price: 95000, image: 'https://picsum.photos/seed/but1/400/400', category: 'Văn phòng phẩm', stock: 45 },
  { name: 'Áo khoác dù nhẹ', description: 'Chống nước, gấp gọn bỏ túi, phù hợp đi du lịch', price: 380000, image: 'https://picsum.photos/seed/ao2/400/400', category: 'Thời trang', stock: 28 },
  { name: 'Chuột không dây', description: 'Kết nối USB Nano, pin AA dùng 18 tháng', price: 250000, image: 'https://picsum.photos/seed/chuot1/400/400', category: 'Điện tử', stock: 33 },
];

const run = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    if (!uri || uri.includes('<user>')) {
      // Nếu không có URI thật, kết nối local
      uri = 'mongodb://127.0.0.1:27017/ecommerce_demo';
    }

    await mongoose.connect(uri);
    console.log('Đã kết nối MongoDB');

    // Xóa dữ liệu cũ
    await Promise.all([User.deleteMany(), Product.deleteMany(), Cart.deleteMany()]);

    // Tạo admin
    const adminPass = await bcrypt.hash('admin123', 10);
    const admin = await User.create({ name: 'Admin', email: 'admin@shop.com', password: adminPass, role: 'admin' });
    await Cart.create({ userId: admin._id, items: [] });

    // Tạo user thường
    const userPass = await bcrypt.hash('user123', 10);
    const user = await User.create({ name: 'Nguyễn Văn A', email: 'user@shop.com', password: userPass, role: 'user' });
    await Cart.create({ userId: user._id, items: [] });

    // Tạo sản phẩm
    await Product.insertMany(products);

    console.log('✅ Seed thành công!');
    console.log('👤 Admin:  admin@shop.com / admin123');
    console.log('👤 User:   user@shop.com  / user123');
    console.log(`📦 Đã tạo ${products.length} sản phẩm`);
    process.exit(0);
  } catch (err) {
    console.error('Lỗi seed:', err.message);
    process.exit(1);
  }
};

run();
