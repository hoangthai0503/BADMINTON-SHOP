# 📚 HƯỚNG DẪN CHI TIẾT — ĐỒ ÁN E-COMMERCE

> Tài liệu này ghi lại **toàn bộ code + giải thích từng dòng** để bạn có thể tự viết lại dự án.
> Mục tiêu: đồ án mức 8 điểm — đủ tính năng, dễ demo, không over-engineering.

---

## MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Tech Stack & Lý do chọn](#2-tech-stack--lý-do-chọn)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Cách dữ liệu chạy trong app](#4-cách-dữ-liệu-chạy-trong-app)
5. [BACKEND — B1: Setup Express](#5-backend--b1-setup-express)
6. [BACKEND — B2: Kết nối MongoDB](#6-backend--b2-kết-nối-mongodb)
7. [BACKEND — B3: Models (Mongoose)](#7-backend--b3-models-mongoose)
8. [BACKEND — B4: Auth (JWT)](#8-backend--b4-auth-jwt)
9. [BACKEND — B5: Product CRUD](#9-backend--b5-product-crud)
10. [BACKEND — B6: Cart](#10-backend--b6-cart)
11. [BACKEND — B7: Order (Checkout)](#11-backend--b7-order-checkout)
12. [FRONTEND — F1: Setup Vite + Axios + AuthContext](#12-frontend--f1-setup-vite--axios--authcontext)
13. [FRONTEND — F2: Auth UI (Login/Register)](#13-frontend--f2-auth-ui-loginregister)
14. [FRONTEND — F3: Trang sản phẩm](#14-frontend--f3-trang-sản-phẩm)
15. [FRONTEND — F4: Giỏ hàng (Cart)](#15-frontend--f4-giỏ-hàng-cart)
16. [FRONTEND — F5: Checkout + Lịch sử đơn hàng](#16-frontend--f5-checkout--lịch-sử-đơn-hàng)
17. [FRONTEND — F6: Admin Panel](#17-frontend--f6-admin-panel)
18. [Biến môi trường (.env)](#18-biến-môi-trường-env)
19. [Chạy dự án](#19-chạy-dự-án)
20. [Luồng hoạt động đầy đủ (để demo)](#20-luồng-hoạt-động-đầy-đủ-để-demo)

---

## 1. Tổng quan dự án

Đây là web bán hàng (e-commerce) cơ bản gồm:

| Chức năng | Mô tả |
|-----------|-------|
| Đăng ký / Đăng nhập | JWT, mật khẩu hash bằng bcrypt |
| Xem sản phẩm | Danh sách, tìm kiếm, lọc giá, phân trang |
| Chi tiết sản phẩm | Xem thông tin, thêm vào giỏ |
| Giỏ hàng | Thêm/sửa/xóa sản phẩm |
| Đặt hàng (Checkout) | Snapshot giá tại thời điểm mua |
| Lịch sử đơn hàng | Xem các đơn đã đặt |
| Admin panel | CRUD sản phẩm (chỉ role admin) |

---

## 2. Tech Stack & Lý do chọn

| Layer | Công nghệ | Lý do |
|-------|-----------|-------|
| Frontend | React (Vite) | Nhanh, hot reload, học phổ biến |
| Routing | React Router v6 | Điều hướng SPA |
| HTTP client | Axios | Dễ dùng hơn fetch, có interceptor |
| Backend | Node.js + Express | Nhẹ, dễ setup, JS xuyên suốt |
| Database | MongoDB Atlas | Free tier, schema linh hoạt, cloud |
| ODM | Mongoose | Dễ định nghĩa schema, validate |
| Auth | JWT + bcryptjs | Stateless, không cần session |
| Styling | Inline style / CSS module | Không cần cài thêm gì |

---

## 3. Cấu trúc thư mục

```
ecommerce/
├── backend/                    ← Node.js + Express API
│   ├── config/
│   │   └── db.js               ← Kết nối MongoDB
│   ├── middleware/
│   │   ├── auth.js             ← Kiểm tra JWT token
│   │   └── isAdmin.js          ← Kiểm tra role admin
│   ├── models/
│   │   ├── User.js             ← Schema người dùng
│   │   ├── Product.js          ← Schema sản phẩm
│   │   ├── Cart.js             ← Schema giỏ hàng
│   │   └── Order.js            ← Schema đơn hàng
│   ├── controllers/
│   │   ├── auth.controller.js      ← Logic register/login
│   │   ├── product.controller.js   ← Logic CRUD sản phẩm
│   │   ├── cart.controller.js      ← Logic giỏ hàng
│   │   └── order.controller.js     ← Logic đặt hàng
│   ├── routes/
│   │   ├── auth.routes.js      ← Định nghĩa URL auth
│   │   ├── product.routes.js   ← Định nghĩa URL product
│   │   ├── cart.routes.js      ← Định nghĩa URL cart
│   │   └── order.routes.js     ← Định nghĩa URL order
│   ├── .env                    ← Biến môi trường (không commit)
│   ├── server.js               ← Khởi động server
│   └── package.json
│
└── frontend/                   ← React (Vite)
    ├── src/
    │   ├── api/
    │   │   └── axiosInstance.js    ← Axios với baseURL + token tự động
    │   ├── context/
    │   │   └── AuthContext.jsx     ← Global state: user, login, logout
    │   ├── components/
    │   │   ├── Navbar.jsx          ← Thanh điều hướng
    │   │   ├── ProductCard.jsx     ← Card hiển thị 1 sản phẩm
    │   │   └── PrivateRoute.jsx    ← Chặn route cần đăng nhập
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── ProductListPage.jsx
    │   │   ├── ProductDetailPage.jsx
    │   │   ├── CartPage.jsx
    │   │   ├── CheckoutPage.jsx
    │   │   ├── OrderHistoryPage.jsx
    │   │   └── admin/
    │   │       └── AdminProductPage.jsx
    │   ├── App.jsx               ← Định nghĩa tất cả Routes
    │   └── main.jsx              ← Entry point React
    └── package.json
```

---

## 4. Cách dữ liệu chạy trong app

```
[React UI]
    ↓ gọi API qua Axios (với JWT token trong header)
[Express Router]
    ↓ chuyển tới đúng route
[Middleware] (auth.js kiểm tra token, isAdmin.js kiểm tra role)
    ↓ nếu hợp lệ
[Controller] (xử lý logic nghiệp vụ)
    ↓ đọc/ghi dữ liệu
[Mongoose Model]
    ↓ truy vấn
[MongoDB Atlas] (cloud database)
    ↑ trả về dữ liệu
[Controller] → JSON response
    ↑
[React UI] cập nhật giao diện
```

---

## 5. BACKEND — B1: Setup Express

### Bước thực hiện:
```bash
mkdir backend
cd backend
npm init -y
npm install express cors dotenv bcryptjs jsonwebtoken mongoose
npm install -D nodemon
```

### `backend/package.json` — thêm script dev:
```json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

### `backend/server.js`:
```javascript
// server.js — Điểm khởi động của ứng dụng backend
// File này: khởi tạo Express, kết nối DB, đăng ký tất cả routes

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Bước 1: Nạp biến môi trường từ file .env vào process.env
// Phải gọi trước khi dùng process.env.PORT, process.env.MONGODB_URI, v.v.
dotenv.config();

// Bước 2: Kết nối MongoDB (hàm async, chạy ngay khi server start)
connectDB();

// Bước 3: Tạo app Express
const app = express();

// Bước 4: Đăng ký middleware toàn cục
// cors(): cho phép frontend (port 5173) gọi API sang backend (port 5000)
//         không có cors, trình duyệt sẽ chặn request (CORS policy error)
app.use(cors());

// express.json(): cho phép đọc body của request dạng JSON
//                 không có middleware này, req.body sẽ là undefined
app.use(express.json());

// Bước 5: Đăng ký routes
// Mỗi file routes xử lý một nhóm endpoint
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/orders', require('./routes/order.routes'));

// Route kiểm tra server có chạy không
app.get('/', (req, res) => {
  res.json({ success: true, message: 'E-commerce API đang chạy' });
});

// Bước 6: Lắng nghe kết nối trên PORT từ .env, mặc định 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
```

---

## 6. BACKEND — B2: Kết nối MongoDB

### `backend/config/db.js`:
```javascript
// config/db.js — Cấu hình kết nối MongoDB Atlas bằng Mongoose
// Mongoose là ODM (Object Document Mapper) — giúp làm việc với MongoDB
// dễ hơn thông qua Schema và Model thay vì viết query thuần

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // mongoose.connect() trả về Promise nên dùng await
    // MONGODB_URI lấy từ .env — chứa username, password, cluster URL
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    // conn.connection.host là địa chỉ MongoDB server đã kết nối
    console.log(`MongoDB đã kết nối: ${conn.connection.host}`);
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error.message);
    // process.exit(1) = thoát ứng dụng với mã lỗi 1
    // Nếu không kết nối được DB thì không nên để server chạy
    process.exit(1);
  }
};

module.exports = connectDB;
```

### `backend/.env` (tạo file này, KHÔNG commit lên git):
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ecommerce
JWT_SECRET=mot_chuoi_bi_mat_du_dai_va_phuc_tap_123456
JWT_EXPIRES_IN=7d
```

> **Cách lấy MONGODB_URI từ Atlas:**
> 1. Vào mongodb.com/atlas → tạo tài khoản free
> 2. Tạo Cluster (free M0)
> 3. Database Access → tạo user + password
> 4. Network Access → Allow from anywhere (0.0.0.0/0)
> 5. Connect → Drivers → Copy connection string
> 6. Thay `<password>` và `<dbname>` bằng thông tin thực

---

## 7. BACKEND — B3: Models (Mongoose)

> **Models là gì?** Schema định nghĩa "hình dạng" của document trong MongoDB.
> Mongoose sẽ validate dữ liệu trước khi lưu vào DB.

### `backend/models/User.js`:
```javascript
// models/User.js — Schema cho collection "users" trong MongoDB
// Mỗi document trong collection users sẽ có cấu trúc theo schema này

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true  // Bắt buộc phải có, nếu không có sẽ báo lỗi validation
  },
  email: {
    type: String,
    required: true,
    unique: true    // Không cho phép 2 user có cùng email
                    // Mongoose tự tạo index unique trong MongoDB
  },
  password: {
    type: String,
    required: true
    // Lưu ý: đây là password đã hash, KHÔNG bao giờ lưu plaintext
  },
  role: {
    type: String,
    default: 'user'   // Mặc định là 'user', chỉ admin mới có role 'admin'
    // Enum: ['user', 'admin'] — có thể thêm enum để validate chặt hơn
  }
}, {
  timestamps: true  // Tự động thêm createdAt và updatedAt
});

// module.exports tên Model phải viết hoa (User)
// Mongoose tự chuyển thành tên collection viết thường số nhiều: "users"
module.exports = mongoose.model('User', userSchema);
```

### `backend/models/Product.js`:
```javascript
// models/Product.js — Schema cho collection "products"

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0          // Giá không được âm
  },
  image: {
    type: String,   // Lưu URL ảnh (ví dụ: https://picsum.photos/400/300)
    default: ''
  },
  category: {
    type: String,
    default: 'Khác'
  },
  stock: {
    type: Number,
    default: 0,
    min: 0          // Số lượng tồn kho không được âm
  },
  isActive: {
    type: Boolean,
    default: true   // true = sản phẩm đang bán, false = ẩn sản phẩm
                    // Dùng để "xóa mềm" — không xóa thật khỏi DB
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
```

### `backend/models/Cart.js`:
```javascript
// models/Cart.js — Schema cho collection "carts"
// Mỗi user CHỈ có đúng 1 cart (userId unique)
// Cart lưu cache thông tin sản phẩm (name, price, image) để hiển thị nhanh

const mongoose = require('mongoose');

// Sub-schema cho từng item trong giỏ hàng
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,  // Tham chiếu tới collection Products
    ref: 'Product',
    required: true
  },
  name: String,     // Cache tên sản phẩm — để hiển thị không cần query Product
  price: Number,    // Cache giá — CHÚ Ý: đây là giá CŨ, khi checkout sẽ query giá mới
  image: String,    // Cache ảnh
  quantity: {
    type: Number,
    default: 1,
    min: 1
  }
}, {
  _id: false        // Không tạo _id cho mỗi item (tiết kiệm, không cần thiết)
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,   // Mỗi user chỉ có 1 cart
    required: true
  },
  items: [cartItemSchema]   // Mảng các items
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
```

### `backend/models/Order.js`:
```javascript
// models/Order.js — Schema cho collection "orders"
// Order lưu SNAPSHOT đầy đủ: tên, giá, ảnh tại thời điểm mua
// Lý do: nếu admin đổi giá sản phẩm sau này, order cũ vẫn giữ đúng giá đã mua

const mongoose = require('mongoose');

// Sub-schema cho từng item trong đơn hàng — giống Cart nhưng là SNAPSHOT
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
    // Không required vì product có thể bị xóa sau này, order vẫn cần tồn tại
  },
  name: String,     // SNAPSHOT — giá trị tại thời điểm checkout, không thay đổi
  price: Number,    // SNAPSHOT — giá tại thời điểm mua (không phải giá hiện tại)
  image: String,    // SNAPSHOT
  quantity: Number
}, {
  _id: false
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'paid', 'cancelled']
    // pending: vừa đặt, chưa thanh toán
    // paid: đã thanh toán
    // cancelled: đã hủy
  },
  shippingAddress: {
    type: String,
    required: true
  }
}, {
  timestamps: true  // createdAt = ngày đặt hàng
});

module.exports = mongoose.model('Order', orderSchema);
```

---

## 8. BACKEND — B4: Auth (JWT)

### `backend/middleware/auth.js`:
```javascript
// middleware/auth.js — Kiểm tra JWT token trong mọi request cần xác thực
// Middleware chạy TRƯỚC controller, giống "bảo vệ cửa"

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Bước 1: Lấy token từ header Authorization
  // Header có dạng: "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
  const authHeader = req.headers['authorization'];

  // Nếu không có header hoặc không bắt đầu bằng "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Không có token, từ chối truy cập' });
  }

  // Bước 2: Tách token ra khỏi "Bearer "
  // authHeader = "Bearer abc123..." → split(' ')[1] = "abc123..."
  const token = authHeader.split(' ')[1];

  try {
    // Bước 3: Verify token bằng JWT_SECRET
    // Nếu token hợp lệ: trả về payload (dữ liệu đã encode khi tạo token)
    // Nếu token sai/hết hạn: throw error → chạy vào catch
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Bước 4: Gắn thông tin user vào request để controller dùng
    // decoded chứa { userId, role, iat, exp } (iat = issued at, exp = expiry)
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    // Bước 5: Gọi next() để chuyển sang middleware/controller tiếp theo
    next();
  } catch (error) {
    // Token không hợp lệ (sai chữ ký) hoặc đã hết hạn
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
  }
};

module.exports = auth;
```

### `backend/middleware/isAdmin.js`:
```javascript
// middleware/isAdmin.js — Kiểm tra user có phải admin không
// Phải dùng SAU middleware auth.js (cần req.user đã được gắn)

const isAdmin = (req, res, next) => {
  // req.user được gắn bởi auth.js ở bước trước
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền admin'
    });
    // 403 Forbidden: có token hợp lệ nhưng không đủ quyền
    // (khác với 401 Unauthorized: không có hoặc sai token)
  }
  next();
};

module.exports = isAdmin;
```

### `backend/controllers/auth.controller.js`:
```javascript
// controllers/auth.controller.js — Xử lý đăng ký và đăng nhập

const User = require('../models/User');
const Cart = require('../models/Cart');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ======================== ĐĂNG KÝ ========================
// POST /api/auth/register
const register = async (req, res) => {
  try {
    // Bước 1: Lấy dữ liệu từ request body
    const { name, email, password } = req.body;

    // Bước 2: Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Bước 3: Hash password trước khi lưu
    // saltRounds = 10: độ phức tạp của hash (cao hơn = an toàn hơn nhưng chậm hơn)
    // bcrypt tự thêm "salt" vào password để chống rainbow table attack
    const hashedPassword = await bcrypt.hash(password, 10);

    // Bước 4: Tạo user mới trong DB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user'  // Mặc định role user, không cho phép tự đặt role admin
    });

    // Bước 5: Tạo Cart rỗng cho user mới
    // Mỗi user có đúng 1 cart, tạo ngay khi đăng ký để sau không cần kiểm tra
    await Cart.create({ userId: user._id, items: [] });

    // Bước 6: Tạo JWT token
    // jwt.sign(payload, secret, options)
    // payload: dữ liệu muốn encode vào token (không lưu password)
    const token = jwt.sign(
      { userId: user._id, role: user.role },  // payload
      process.env.JWT_SECRET,                  // secret key
      { expiresIn: process.env.JWT_EXPIRES_IN } // hết hạn sau 7 ngày
    );

    // Bước 7: Trả về token và thông tin user (không trả password)
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== ĐĂNG NHẬP ========================
// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Bước 1: Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      // Không nói rõ "email không tồn tại" để tránh lộ thông tin
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // Bước 2: So sánh password nhập vào với hash trong DB
    // bcrypt.compare() tự lấy salt từ hash và compare
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // Bước 3: Tạo JWT token (giống register)
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login };
```

### `backend/routes/auth.routes.js`:
```javascript
// routes/auth.routes.js — Định nghĩa URL endpoints cho auth
// Router của Express giúp nhóm các route liên quan với nhau

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');

// POST /api/auth/register — không cần auth middleware (ai cũng đăng ký được)
router.post('/register', register);

// POST /api/auth/login — không cần auth middleware
router.post('/login', login);

module.exports = router;
```

---

## 9. BACKEND — B5: Product CRUD

### `backend/controllers/product.controller.js`:
```javascript
// controllers/product.controller.js — CRUD sản phẩm
// GET (công khai), POST/PUT/DELETE (chỉ admin)

const Product = require('../models/Product');

// ======================== LẤY DANH SÁCH SẢN PHẨM ========================
// GET /api/products?page=1&limit=10&search=áo&minPrice=100&maxPrice=500&sort=price_asc
const getProducts = async (req, res) => {
  try {
    // Đọc query params, đặt giá trị mặc định nếu không có
    const page = parseInt(req.query.page) || 1;       // Trang hiện tại
    const limit = parseInt(req.query.limit) || 10;    // Số sản phẩm mỗi trang
    const search = req.query.search || '';
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || Infinity;
    const sort = req.query.sort || '';

    // Xây dựng query filter
    const filter = {
      isActive: true,         // Chỉ lấy sản phẩm đang bán
      price: { $gte: minPrice, $lte: maxPrice }  // Lọc theo giá
    };

    // Nếu có tìm kiếm, thêm điều kiện regex (không phân biệt hoa thường)
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
      // $regex: tìm kiếm pattern trong chuỗi
      // $options: 'i' = case-insensitive
    }

    // Xử lý sắp xếp
    let sortOption = {};
    if (sort === 'price_asc') sortOption = { price: 1 };   // 1 = tăng dần
    if (sort === 'price_desc') sortOption = { price: -1 };  // -1 = giảm dần

    // Tính skip: bỏ qua bao nhiêu document (phân trang)
    // Trang 1: skip 0, Trang 2: skip 10, Trang 3: skip 20, ...
    const skip = (page - 1) * limit;

    // Query song song để tối ưu: đếm total và lấy data cùng lúc
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limit),
      Product.countDocuments(filter)  // Tổng số sản phẩm (để tính số trang)
    ]);

    res.json({
      success: true,
      data: {
        products,
        total,
        page,
        totalPages: Math.ceil(total / limit)  // Làm tròn lên
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== LẤY 1 SẢN PHẨM ========================
// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    // req.params.id là phần ":id" trong URL
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== TẠO SẢN PHẨM (ADMIN) ========================
// POST /api/products
const createProduct = async (req, res) => {
  try {
    // req.body chứa dữ liệu từ form admin gửi lên
    const { name, description, price, image, category, stock } = req.body;

    const product = await Product.create({
      name, description, price, image, category, stock
    });

    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== CẬP NHẬT SẢN PHẨM (ADMIN) ========================
// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    // { new: true } = trả về document SAU khi update (mặc định trả về document cũ)
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,       // Cập nhật tất cả fields trong body
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    res.json({ success: true, message: 'Cập nhật thành công', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== XÓA SẢN PHẨM (ADMIN) ========================
// DELETE /api/products/:id — xóa mềm (chỉ đặt isActive = false)
const deleteProduct = async (req, res) => {
  try {
    // Xóa mềm: không xóa thật, chỉ ẩn sản phẩm
    // Lợi ích: Order cũ vẫn còn tham chiếu đến product, không bị mất dữ liệu
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    res.json({ success: true, message: 'Đã xóa sản phẩm' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
```

### `backend/routes/product.routes.js`:
```javascript
// routes/product.routes.js — Định nghĩa URL cho product
// Chú ý: GET public (không cần auth), POST/PUT/DELETE cần auth + isAdmin

const express = require('express');
const router = express.Router();
const {
  getProducts, getProductById, createProduct, updateProduct, deleteProduct
} = require('../controllers/product.controller');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Public routes — ai cũng xem được sản phẩm
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin routes — phải có token VÀ phải là admin
// Chuỗi middleware: auth → isAdmin → controller
// Nếu auth fail → 401, nếu isAdmin fail → 403, nếu qua hết → chạy controller
router.post('/', auth, isAdmin, createProduct);
router.put('/:id', auth, isAdmin, updateProduct);
router.delete('/:id', auth, isAdmin, deleteProduct);

module.exports = router;
```

---

## 10. BACKEND — B6: Cart

### `backend/controllers/cart.controller.js`:
```javascript
// controllers/cart.controller.js — Quản lý giỏ hàng
// Tất cả operations đều cần JWT (chỉ user đã đăng nhập mới có giỏ hàng)

const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ======================== XEM GIỎ HÀNG ========================
// GET /api/cart
const getCart = async (req, res) => {
  try {
    // req.user.userId được gắn bởi middleware auth.js
    const cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giỏ hàng' });
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== THÊM VÀO GIỎ HÀNG ========================
// POST /api/cart/add
// Body: { productId, quantity }
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Bước 1: Kiểm tra sản phẩm tồn tại và còn hàng
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Không đủ hàng trong kho' });
    }

    // Bước 2: Lấy giỏ hàng của user
    const cart = await Cart.findOne({ userId: req.user.userId });

    // Bước 3: Kiểm tra xem sản phẩm đã có trong giỏ chưa
    // toString() để so sánh ObjectId (MongoDB) với string
    const existingItem = cart.items.find(
      item => item.productId.toString() === productId
    );

    if (existingItem) {
      // Nếu đã có: tăng số lượng
      existingItem.quantity += quantity;
    } else {
      // Nếu chưa có: thêm item mới vào mảng
      cart.items.push({
        productId: product._id,
        name: product.name,     // Cache lại để hiển thị nhanh
        price: product.price,   // Cache giá hiện tại (có thể thay đổi sau)
        image: product.image,
        quantity
      });
    }

    // Bước 4: Lưu cart vào DB
    await cart.save();

    res.json({ success: true, message: 'Đã thêm vào giỏ hàng', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== CẬP NHẬT SỐ LƯỢNG ========================
// PUT /api/cart/update
// Body: { productId, quantity }
const updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.user.userId });
    const item = cart.items.find(i => i.productId.toString() === productId);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không có trong giỏ' });
    }

    if (quantity <= 0) {
      // Nếu số lượng = 0: xóa item khỏi giỏ
      // filter() trả về mảng mới không có item đó
      cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json({ success: true, message: 'Đã cập nhật giỏ hàng', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== XÓA KHỎI GIỎ HÀNG ========================
// DELETE /api/cart/remove
// Body: { productId }
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ userId: req.user.userId });

    // Lọc ra các item KHÁC productId cần xóa
    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    await cart.save();
    res.json({ success: true, message: 'Đã xóa khỏi giỏ hàng', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCart, removeFromCart };
```

### `backend/routes/cart.routes.js`:
```javascript
// routes/cart.routes.js — Tất cả cart routes đều cần auth

const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCart, removeFromCart } = require('../controllers/cart.controller');
const auth = require('../middleware/auth');

// auth middleware được áp dụng cho TẤT CẢ routes trong file này
// Thay vì viết auth cho từng route, dùng router.use()
router.use(auth);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCart);
router.delete('/remove', removeFromCart);

module.exports = router;
```

---

## 11. BACKEND — B7: Order (Checkout)

### `backend/controllers/order.controller.js`:
```javascript
// controllers/order.controller.js — Đặt hàng và xem lịch sử

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ======================== ĐẶT HÀNG (CHECKOUT) ========================
// POST /api/orders
// Body: { shippingAddress }
const createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // Bước 1: Lấy giỏ hàng hiện tại của user
    const cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống, không thể đặt hàng'
      });
    }

    // Bước 2: Với mỗi item trong cart, query lại Product để lấy giá MỚI NHẤT
    // QUAN TRỌNG: Không dùng giá trong Cart (có thể đã cũ nếu admin đổi giá)
    const snapshotItems = [];
    let totalPrice = 0;

    for (const cartItem of cart.items) {
      // Query Product từ DB (giá mới nhất)
      const product = await Product.findById(cartItem.productId);

      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${cartItem.name}" không còn tồn tại`
        });
      }

      // Build snapshot: dữ liệu lúc này, không thay đổi nữa
      snapshotItems.push({
        productId: product._id,
        name: product.name,       // Lấy từ Product (không từ Cart)
        price: product.price,     // Giá MỚI NHẤT từ Product
        image: product.image,
        quantity: cartItem.quantity
      });

      // Tính tổng từ giá mới nhất
      totalPrice += product.price * cartItem.quantity;
    }

    // Bước 3: Tạo Order với snapshot data
    const order = await Order.create({
      userId: req.user.userId,
      items: snapshotItems,
      totalPrice,
      shippingAddress,
      status: 'pending'
    });

    // Bước 4: Xóa sạch giỏ hàng sau khi đặt hàng thành công
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== XEM LỊCH SỬ ĐƠN HÀNG ========================
// GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    // Tìm tất cả orders của user hiện tại, sắp xếp mới nhất trước
    const orders = await Order.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });  // -1 = giảm dần = mới nhất trước

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, getMyOrders };
```

### `backend/routes/order.routes.js`:
```javascript
// routes/order.routes.js — Order routes đều cần auth

const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders } = require('../controllers/order.controller');
const auth = require('../middleware/auth');

router.use(auth);  // Tất cả routes cần đăng nhập

router.post('/', createOrder);
router.get('/my', getMyOrders);

module.exports = router;
```

---

## 12. FRONTEND — F1: Setup Vite + Axios + AuthContext

### Khởi tạo project:
```bash
cd ecommerce
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom axios
```

### `frontend/src/api/axiosInstance.js`:
```javascript
// api/axiosInstance.js — Tạo axios instance với cấu hình mặc định
// Tất cả API calls trong app sẽ dùng instance này thay vì axios trực tiếp
// Lợi ích: baseURL và token tự động thêm vào mọi request

import axios from 'axios';

// Tạo instance với baseURL của backend
// Khi gọi axiosInstance.get('/products') thực ra gọi http://localhost:5000/api/products
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Interceptor: chạy trước mỗi request — tự động thêm JWT token vào header
// Không cần thêm token thủ công ở từng API call
axiosInstance.interceptors.request.use((config) => {
  // Lấy token đã lưu trong localStorage
  const token = localStorage.getItem('token');

  if (token) {
    // Thêm vào header Authorization theo format "Bearer <token>"
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;  // Phải return config để request tiếp tục
});

export default axiosInstance;
```

### `frontend/src/context/AuthContext.jsx`:
```jsx
// context/AuthContext.jsx — Global state cho authentication
// React Context giúp share state giữa các component mà không cần prop drilling
// Prop drilling = truyền props qua nhiều lớp component

import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Bước 1: Tạo Context object
const AuthContext = createContext(null);

// Bước 2: Provider — bọc quanh app để cung cấp state cho mọi component con
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Khởi tạo state từ localStorage (để persist sau khi refresh trang)
  // Khi user refresh: lấy lại token và user info từ localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    // JSON.parse vì localStorage chỉ lưu string
    return saved ? JSON.parse(saved) : null;
  });

  // Hàm login: lưu vào state VÀ localStorage
  const login = (tokenValue, userData) => {
    setToken(tokenValue);
    setUser(userData);
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Hàm logout: xóa state VÀ localStorage, chuyển về trang login
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // isLoggedIn: computed value, dùng trong các component để kiểm tra trạng thái
  const isLoggedIn = !!token;  // !! chuyển string thành boolean
  const isAdmin = user?.role === 'admin';  // ?. optional chaining: tránh lỗi nếu user null

  return (
    // value: object chứa tất cả state và functions cần share
    <AuthContext.Provider value={{ token, user, login, logout, isLoggedIn, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// Bước 3: Custom hook để dễ dàng sử dụng context
// Thay vì import useContext + AuthContext ở mọi file, chỉ cần import useAuth
export const useAuth = () => useContext(AuthContext);
```

### `frontend/src/components/PrivateRoute.jsx`:
```jsx
// components/PrivateRoute.jsx — Chặn route cần đăng nhập
// Nếu chưa đăng nhập → redirect về /login
// Nếu đã đăng nhập → hiển thị nội dung route bình thường

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// adminOnly: prop để chỉ định route chỉ cho admin
const PrivateRoute = ({ children, adminOnly = false }) => {
  const { isLoggedIn, isAdmin } = useAuth();

  // Chưa đăng nhập → về trang login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
    // replace: không thêm vào history (để user không "back" về route bị chặn)
  }

  // Đã đăng nhập nhưng không phải admin mà vào route admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Hợp lệ → hiển thị nội dung
  return children;
};

export default PrivateRoute;
```

### `frontend/src/App.jsx`:
```jsx
// App.jsx — Định nghĩa toàn bộ routes của ứng dụng
// React Router v6: dùng <Routes> và <Route> thay vì <Switch>

import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Import tất cả pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AdminProductPage from './pages/admin/AdminProductPage';

function App() {
  return (
    // AuthProvider bọc toàn bộ app để mọi component đều dùng được useAuth()
    <AuthProvider>
      <Navbar />
      <Routes>
        {/* Public routes — ai cũng vào được */}
        <Route path="/" element={<ProductListPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* Private routes — phải đăng nhập */}
        <Route path="/cart" element={
          <PrivateRoute><CartPage /></PrivateRoute>
        } />
        <Route path="/checkout" element={
          <PrivateRoute><CheckoutPage /></PrivateRoute>
        } />
        <Route path="/orders" element={
          <PrivateRoute><OrderHistoryPage /></PrivateRoute>
        } />

        {/* Admin route — phải là admin */}
        <Route path="/admin/products" element={
          <PrivateRoute adminOnly={true}><AdminProductPage /></PrivateRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
```

### `frontend/src/main.jsx`:
```jsx
// main.jsx — Entry point: nơi React "render" vào DOM
// BrowserRouter cần bọc ngoài App để React Router hoạt động

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter cần đặt ĐÂY, không đặt trong App.jsx
        vì AuthProvider dùng useNavigate() — hook của React Router
        phải nằm trong BrowserRouter */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

### `frontend/src/components/Navbar.jsx`:
```jsx
// components/Navbar.jsx — Thanh điều hướng trên cùng

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isLoggedIn, isAdmin, user, logout } = useAuth();

  const styles = {
    nav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      backgroundColor: '#1a1a2e',
      color: 'white'
    },
    logo: { color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' },
    links: { display: 'flex', gap: '16px', alignItems: 'center' },
    link: { color: '#ccc', textDecoration: 'none' },
    btn: {
      background: '#e94560', color: 'white', border: 'none',
      padding: '6px 14px', borderRadius: '4px', cursor: 'pointer'
    }
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>🛒 Shop</Link>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Sản phẩm</Link>

        {isLoggedIn ? (
          <>
            <Link to="/cart" style={styles.link}>Giỏ hàng</Link>
            <Link to="/orders" style={styles.link}>Đơn hàng</Link>
            {/* Chỉ hiển thị link admin nếu user là admin */}
            {isAdmin && <Link to="/admin/products" style={styles.link}>Admin</Link>}
            <span style={{ color: '#aaa' }}>Xin chào, {user?.name}</span>
            <button onClick={logout} style={styles.btn}>Đăng xuất</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Đăng nhập</Link>
            <Link to="/register" style={styles.link}>Đăng ký</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
```

---

## 13. FRONTEND — F2: Auth UI (Login/Register)

### `frontend/src/pages/LoginPage.jsx`:
```jsx
// pages/LoginPage.jsx — Form đăng nhập

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  // State cho form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    // Ngăn form reload trang (hành vi mặc định của HTML form)
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axiosInstance.post('/auth/login', { email, password });

      // Gọi hàm login từ AuthContext để lưu token + user vào state/localStorage
      login(res.data.data.token, res.data.data.user);

      // Chuyển về trang chủ sau khi đăng nhập thành công
      navigate('/');
    } catch (err) {
      // err.response.data.message là message từ backend
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { maxWidth: '400px', margin: '80px auto', padding: '32px', boxShadow: '0 2px 16px rgba(0,0,0,0.1)', borderRadius: '8px' },
    title: { textAlign: 'center', marginBottom: '24px' },
    group: { marginBottom: '16px' },
    label: { display: 'block', marginBottom: '4px', fontWeight: '500' },
    input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' },
    error: { color: 'red', marginBottom: '12px', textAlign: 'center' },
    link: { textAlign: 'center', marginTop: '16px' }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Đăng nhập</h2>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={styles.group}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.group}>
          <label style={styles.label}>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <button type="submit" style={styles.btn} disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <p style={styles.link}>
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </p>
    </div>
  );
};

export default LoginPage;
```

### `frontend/src/pages/RegisterPage.jsx`:
```jsx
// pages/RegisterPage.jsx — Form đăng ký tài khoản mới

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Xử lý thay đổi chung cho tất cả input (dùng name attribute)
  const handleChange = (e) => {
    // Spread operator: copy tất cả fields cũ, chỉ update field có name = e.target.name
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axiosInstance.post('/auth/register', form);
      // Sau khi đăng ký, tự động đăng nhập luôn
      login(res.data.data.token, res.data.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { maxWidth: '400px', margin: '60px auto', padding: '32px', boxShadow: '0 2px 16px rgba(0,0,0,0.1)', borderRadius: '8px' },
    title: { textAlign: 'center', marginBottom: '24px' },
    group: { marginBottom: '16px' },
    label: { display: 'block', marginBottom: '4px', fontWeight: '500' },
    input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' },
    error: { color: 'red', marginBottom: '12px', textAlign: 'center' }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Đăng ký</h2>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {[
          { label: 'Họ tên', name: 'name', type: 'text' },
          { label: 'Email', name: 'email', type: 'email' },
          { label: 'Mật khẩu', name: 'password', type: 'password' }
        ].map(field => (
          <div key={field.name} style={styles.group}>
            <label style={styles.label}>{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
        ))}

        <button type="submit" style={styles.btn} disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng ký'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '16px' }}>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
```

---

## 14. FRONTEND — F3: Trang sản phẩm

### `frontend/src/components/ProductCard.jsx`:
```jsx
// components/ProductCard.jsx — Card hiển thị thông tin 1 sản phẩm
// Được dùng trong ProductListPage để render danh sách

import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  // Định dạng giá tiền theo chuẩn Việt Nam
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const styles = {
    card: {
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
      cursor: 'pointer'
    },
    img: { width: '100%', height: '200px', objectFit: 'cover' },
    body: { padding: '12px' },
    name: { fontWeight: '600', marginBottom: '4px', fontSize: '15px' },
    category: { color: '#888', fontSize: '13px', marginBottom: '8px' },
    price: { color: '#e94560', fontWeight: 'bold', fontSize: '16px' },
    stock: { color: '#666', fontSize: '13px', marginTop: '4px' },
    link: { textDecoration: 'none', color: 'inherit' }
  };

  return (
    // Link bọc card → click vào đâu cũng navigate đến detail page
    <Link to={`/products/${product._id}`} style={styles.link}>
      <div style={styles.card}>
        <img
          src={product.image || 'https://via.placeholder.com/400x300'}
          alt={product.name}
          style={styles.img}
          // Fallback nếu ảnh lỗi
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300'; }}
        />
        <div style={styles.body}>
          <p style={styles.name}>{product.name}</p>
          <p style={styles.category}>{product.category}</p>
          <p style={styles.price}>{formatPrice(product.price)}</p>
          <p style={styles.stock}>Còn {product.stock} sản phẩm</p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
```

### `frontend/src/pages/ProductListPage.jsx`:
```jsx
// pages/ProductListPage.jsx — Trang danh sách sản phẩm với search, filter, phân trang

import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';

const ProductListPage = () => {
  // State cho danh sách sản phẩm và thông tin phân trang
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // State cho các bộ lọc
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');

  // useEffect: chạy fetchProducts mỗi khi page, search, filter thay đổi
  useEffect(() => {
    fetchProducts();
  }, [page, search, minPrice, maxPrice, sort]);
  // Mảng dependency: chỉ re-run khi một trong các giá trị này thay đổi

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Xây dựng query params động
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sort) params.sort = sort;

      const res = await axiosInstance.get('/products', { params });
      setProducts(res.data.data.products);
      setTotal(res.data.data.total);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Khi thay đổi search/filter: reset về trang 1
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
    filterBar: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' },
    input: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' },
    select: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' },
    btn: { padding: '8px 16px', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' },
    pagination: { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' },
    pageBtn: (active) => ({
      padding: '8px 14px', border: '1px solid #ddd', borderRadius: '4px',
      cursor: 'pointer', backgroundColor: active ? '#1a1a2e' : 'white',
      color: active ? 'white' : 'black'
    })
  };

  return (
    <div style={styles.container}>
      <h2>Sản phẩm ({total})</h2>

      {/* Thanh tìm kiếm và lọc */}
      <form onSubmit={handleSearch} style={styles.filterBar}>
        <input
          type="text" placeholder="Tìm kiếm..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
        />
        <input
          type="number" placeholder="Giá tối thiểu"
          value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
          style={{ ...styles.input, width: '120px' }}
        />
        <input
          type="number" placeholder="Giá tối đa"
          value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
          style={{ ...styles.input, width: '120px' }}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={styles.select}>
          <option value="">Sắp xếp mặc định</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
        </select>
        <button type="submit" style={styles.btn}>Lọc</button>
      </form>

      {/* Loading state */}
      {loading ? (
        <p style={{ textAlign: 'center' }}>Đang tải...</p>
      ) : (
        <>
          {/* Grid sản phẩm */}
          <div style={styles.grid}>
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              {/* Array.from tạo mảng [1, 2, 3, ...totalPages] để map */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={styles.pageBtn(p === page)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductListPage;
```

### `frontend/src/pages/ProductDetailPage.jsx`:
```jsx
// pages/ProductDetailPage.jsx — Trang chi tiết sản phẩm + nút thêm vào giỏ

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const ProductDetailPage = () => {
  const { id } = useParams();  // Lấy :id từ URL /products/:id
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);  // Re-fetch khi id trong URL thay đổi

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      // Chưa đăng nhập → chuyển về trang login
      navigate('/login');
      return;
    }

    try {
      await axiosInstance.post('/cart/add', { productId: product._id, quantity });
      setMessage('Đã thêm vào giỏ hàng!');
      // Xóa message sau 2 giây
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải...</p>;
  if (!product) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Không tìm thấy sản phẩm</p>;

  const styles = {
    container: { maxWidth: '900px', margin: '32px auto', padding: '0 24px', display: 'flex', gap: '48px', flexWrap: 'wrap' },
    img: { width: '400px', maxWidth: '100%', borderRadius: '8px', objectFit: 'cover' },
    info: { flex: 1, minWidth: '250px' },
    price: { fontSize: '28px', fontWeight: 'bold', color: '#e94560', margin: '16px 0' },
    quantityRow: { display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' },
    qtyBtn: { width: '32px', height: '32px', fontSize: '18px', cursor: 'pointer' },
    btn: { padding: '12px 32px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' },
    message: { marginTop: '12px', color: 'green', fontWeight: '500' }
  };

  return (
    <div style={styles.container}>
      <img
        src={product.image || 'https://via.placeholder.com/400x400'}
        alt={product.name}
        style={styles.img}
      />
      <div style={styles.info}>
        <p style={{ color: '#888' }}>{product.category}</p>
        <h1>{product.name}</h1>
        <p style={styles.price}>{formatPrice(product.price)}</p>
        <p>{product.description}</p>
        <p>Còn lại: <strong>{product.stock}</strong> sản phẩm</p>

        <div style={styles.quantityRow}>
          <span>Số lượng:</span>
          <button style={styles.qtyBtn} onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
          <span>{quantity}</span>
          <button style={styles.qtyBtn} onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
        </div>

        <button onClick={handleAddToCart} style={styles.btn} disabled={product.stock === 0}>
          {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default ProductDetailPage;
```

---

## 15. FRONTEND — F4: Giỏ hàng (Cart)

### `frontend/src/pages/CartPage.jsx`:
```jsx
// pages/CartPage.jsx — Trang giỏ hàng: xem, sửa số lượng, xóa, đến checkout

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await axiosInstance.get('/cart');
      setCart(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật số lượng item
  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      const res = await axiosInstance.put('/cart/update', { productId, quantity });
      setCart(res.data.data);  // Cập nhật state với cart mới từ server
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Xóa item khỏi giỏ
  const handleRemove = async (productId) => {
    try {
      const res = await axiosInstance.delete('/cart/remove', {
        data: { productId }  // Axios DELETE cần truyền body qua config.data
      });
      setCart(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Tính tổng tiền từ items trong cart (dùng giá cache — chỉ để hiển thị)
  const calcTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const styles = {
    container: { maxWidth: '800px', margin: '32px auto', padding: '0 24px' },
    item: { display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #eee' },
    img: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' },
    name: { fontWeight: '600', flex: 1 },
    qtyBtn: { width: '28px', height: '28px', cursor: 'pointer' },
    removeBtn: { color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' },
    total: { textAlign: 'right', fontSize: '20px', margin: '24px 0' },
    checkoutBtn: { display: 'block', width: '100%', padding: '14px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải giỏ hàng...</p>;

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '80px' }}>
        <p style={{ fontSize: '20px' }}>Giỏ hàng trống</p>
        <button onClick={() => navigate('/')} style={{ ...styles.checkoutBtn, width: 'auto', padding: '10px 24px', marginTop: '16px' }}>
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Giỏ hàng ({items.length} sản phẩm)</h2>

      {items.map(item => (
        <div key={item.productId} style={styles.item}>
          <img src={item.image || 'https://via.placeholder.com/80'} alt={item.name} style={styles.img} />
          <span style={styles.name}>{item.name}</span>
          <span>{formatPrice(item.price)}</span>

          {/* Nút điều chỉnh số lượng */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={styles.qtyBtn} onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}>-</button>
            <span>{item.quantity}</span>
            <button style={styles.qtyBtn} onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}>+</button>
          </div>

          <span style={{ minWidth: '100px', textAlign: 'right' }}>
            {formatPrice(item.price * item.quantity)}
          </span>

          <button style={styles.removeBtn} onClick={() => handleRemove(item.productId)}>✕</button>
        </div>
      ))}

      <div style={styles.total}>
        <strong>Tổng cộng: {formatPrice(calcTotal())}</strong>
        <br />
        <small style={{ color: '#888' }}>* Giá chính xác sẽ tính lại khi thanh toán</small>
      </div>

      <button onClick={() => navigate('/checkout')} style={styles.checkoutBtn}>
        Tiến hành thanh toán →
      </button>
    </div>
  );
};

export default CartPage;
```

---

## 16. FRONTEND — F5: Checkout + Lịch sử đơn hàng

### `frontend/src/pages/CheckoutPage.jsx`:
```jsx
// pages/CheckoutPage.jsx — Trang xác nhận và đặt hàng

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axiosInstance.get('/cart');
        setCart(res.data.data);
        // Nếu giỏ trống, quay lại
        if (!res.data.data.items.length) navigate('/cart');
      } catch (err) {
        console.error(err);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      alert('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post('/orders', { shippingAddress: address });
      // Đặt hàng thành công → chuyển sang trang lịch sử đơn hàng
      alert('Đặt hàng thành công!');
      navigate('/orders');
    } catch (err) {
      alert(err.response?.data?.message || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // Tính tổng ước tính (dựa trên giá cache trong cart)
  const estimatedTotal = cart?.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) || 0;

  const styles = {
    container: { maxWidth: '600px', margin: '32px auto', padding: '0 24px' },
    section: { background: '#f9f9f9', borderRadius: '8px', padding: '20px', marginBottom: '20px' },
    item: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
    input: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '15px', boxSizing: 'border-box', marginTop: '8px' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }
  };

  if (fetchLoading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải...</p>;

  return (
    <div style={styles.container}>
      <h2>Xác nhận đặt hàng</h2>

      {/* Danh sách sản phẩm */}
      <div style={styles.section}>
        <h3>Sản phẩm đặt hàng</h3>
        {cart?.items?.map(item => (
          <div key={item.productId} style={styles.item}>
            <span>{item.name} x{item.quantity}</span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <hr />
        <div style={{ ...styles.item, fontWeight: 'bold', color: '#e94560' }}>
          <span>Ước tính:</span>
          <span>{formatPrice(estimatedTotal)}</span>
        </div>
        <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>
          * Giá chính xác sẽ được tính lại theo giá hiện tại khi đặt hàng
        </p>
      </div>

      {/* Form địa chỉ */}
      <form onSubmit={handleOrder}>
        <div style={styles.section}>
          <h3>Địa chỉ giao hàng</h3>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Nhập địa chỉ giao hàng đầy đủ..."
            rows={4}
            style={styles.input}
            required
          />
        </div>

        <button type="submit" style={styles.btn} disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
```

### `frontend/src/pages/OrderHistoryPage.jsx`:
```jsx
// pages/OrderHistoryPage.jsx — Lịch sử đơn hàng của user

import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosInstance.get('/orders/my');
        setOrders(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // Map status sang tiếng Việt và màu sắc
  const statusConfig = {
    pending: { text: 'Chờ xử lý', color: '#f59e0b' },
    paid: { text: 'Đã thanh toán', color: '#10b981' },
    cancelled: { text: 'Đã hủy', color: '#ef4444' }
  };

  const styles = {
    container: { maxWidth: '900px', margin: '32px auto', padding: '0 24px' },
    card: { border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', marginBottom: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    status: (s) => ({
      padding: '4px 12px', borderRadius: '20px',
      backgroundColor: statusConfig[s]?.color || '#888',
      color: 'white', fontSize: '13px', fontWeight: '500'
    }),
    item: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' },
    total: { textAlign: 'right', marginTop: '12px', fontWeight: 'bold', color: '#e94560', fontSize: '18px' }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải...</p>;

  if (orders.length === 0) {
    return <p style={{ textAlign: 'center', marginTop: '80px', fontSize: '18px' }}>Bạn chưa có đơn hàng nào</p>;
  }

  return (
    <div style={styles.container}>
      <h2>Lịch sử đơn hàng ({orders.length})</h2>

      {orders.map(order => (
        <div key={order._id} style={styles.card}>
          <div style={styles.header}>
            <div>
              <span style={{ color: '#888', fontSize: '13px' }}>Mã đơn: </span>
              <strong>{order._id.slice(-8).toUpperCase()}</strong>
              <span style={{ color: '#888', fontSize: '13px', marginLeft: '12px' }}>
                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <span style={styles.status(order.status)}>
              {statusConfig[order.status]?.text || order.status}
            </span>
          </div>

          <p style={{ color: '#666', marginBottom: '12px' }}>
            Giao đến: {order.shippingAddress}
          </p>

          {/* Danh sách sản phẩm trong đơn hàng */}
          {order.items.map((item, idx) => (
            <div key={idx} style={styles.item}>
              <span>{item.name} x{item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}

          <p style={styles.total}>Tổng cộng: {formatPrice(order.totalPrice)}</p>
        </div>
      ))}
    </div>
  );
};

export default OrderHistoryPage;
```

---

## 17. FRONTEND — F6: Admin Panel

### `frontend/src/pages/admin/AdminProductPage.jsx`:
```jsx
// pages/admin/AdminProductPage.jsx — Quản lý sản phẩm (chỉ admin)
// Bảng CRUD: Thêm, Sửa, Xóa sản phẩm

import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

// Form rỗng mặc định
const emptyForm = { name: '', description: '', price: '', image: '', category: '', stock: '' };

const AdminProductPage = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);    // null = đang thêm mới, có giá trị = đang sửa
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Admin cần xem cả sản phẩm isActive=false, dùng limit lớn
      const res = await axiosInstance.get('/products?limit=100');
      setProducts(res.data.data.products);
    } catch (err) {
      console.error(err);
    }
  };

  // Click nút "Sửa": điền form với dữ liệu sản phẩm hiện tại
  const handleEdit = (product) => {
    setEditId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      stock: product.stock
    });
    setShowForm(true);
    // Cuộn lên đầu trang để thấy form
    window.scrollTo(0, 0);
  };

  // Gửi form: tạo mới hoặc cập nhật tùy theo editId
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editId) {
        // Cập nhật sản phẩm
        await axiosInstance.put(`/products/${editId}`, form);
        alert('Cập nhật thành công!');
      } else {
        // Tạo sản phẩm mới
        await axiosInstance.post('/products', form);
        alert('Thêm sản phẩm thành công!');
      }

      // Reset form và refresh danh sách
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  // Xóa mềm sản phẩm (isActive = false)
  const handleDelete = async (id, name) => {
    // Xác nhận trước khi xóa
    if (!window.confirm(`Xóa sản phẩm "${name}"?`)) return;

    try {
      await axiosInstance.delete(`/products/${id}`);
      alert('Đã xóa sản phẩm');
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại');
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const styles = {
    container: { maxWidth: '1100px', margin: '32px auto', padding: '0 24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    addBtn: { padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '15px' },
    formCard: { background: '#f9f9f9', borderRadius: '8px', padding: '24px', marginBottom: '32px', border: '1px solid #e5e7eb' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    group: { marginBottom: '12px' },
    label: { display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' },
    input: { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' },
    submitBtn: { padding: '10px 24px', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    cancelBtn: { padding: '10px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '12px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { background: '#1a1a2e', color: 'white', padding: '12px', textAlign: 'left' },
    td: { padding: '12px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' },
    editBtn: { padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' },
    delBtn: { padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
  };

  const fields = [
    { label: 'Tên sản phẩm', name: 'name', type: 'text', colSpan: 2 },
    { label: 'Giá (VND)', name: 'price', type: 'number' },
    { label: 'Số lượng kho', name: 'stock', type: 'number' },
    { label: 'Danh mục', name: 'category', type: 'text' },
    { label: 'URL ảnh', name: 'image', type: 'text' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Quản lý sản phẩm</h2>
        <button
          style={styles.addBtn}
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}
        >
          {showForm ? 'Đóng form' : '+ Thêm sản phẩm'}
        </button>
      </div>

      {/* Form thêm/sửa sản phẩm */}
      {showForm && (
        <div style={styles.formCard}>
          <h3>{editId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.grid2}>
              {fields.map(f => (
                <div key={f.name} style={{ ...styles.group, gridColumn: f.colSpan === 2 ? '1 / -1' : undefined }}>
                  <label style={styles.label}>{f.label}</label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name]}
                    onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
                    style={styles.input}
                    required={['name', 'price', 'stock'].includes(f.name)}
                  />
                </div>
              ))}
              <div style={{ ...styles.group, gridColumn: '1 / -1' }}>
                <label style={styles.label}>Mô tả</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? 'Đang lưu...' : (editId ? 'Cập nhật' : 'Thêm mới')}
              </button>
              <button type="button" style={styles.cancelBtn}
                onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bảng danh sách sản phẩm */}
      <table style={styles.table}>
        <thead>
          <tr>
            {['Ảnh', 'Tên', 'Danh mục', 'Giá', 'Kho', 'Trạng thái', 'Thao tác'].map(h => (
              <th key={h} style={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <td style={styles.td}>
                <img src={product.image || 'https://via.placeholder.com/60'} alt=""
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
              </td>
              <td style={styles.td}><strong>{product.name}</strong></td>
              <td style={styles.td}>{product.category}</td>
              <td style={styles.td}>{formatPrice(product.price)}</td>
              <td style={styles.td}>{product.stock}</td>
              <td style={styles.td}>
                <span style={{
                  padding: '2px 8px', borderRadius: '12px', fontSize: '13px',
                  backgroundColor: product.isActive ? '#d1fae5' : '#fee2e2',
                  color: product.isActive ? '#065f46' : '#991b1b'
                }}>
                  {product.isActive ? 'Đang bán' : 'Đã ẩn'}
                </span>
              </td>
              <td style={styles.td}>
                <button style={styles.editBtn} onClick={() => handleEdit(product)}>Sửa</button>
                <button style={styles.delBtn} onClick={() => handleDelete(product._id, product.name)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductPage;
```

---

## 18. Biến môi trường (.env)

### `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET=ecommerce_super_secret_key_2024_abc123xyz
JWT_EXPIRES_IN=7d
```

> **Lưu ý bảo mật:**
> - KHÔNG commit file `.env` lên git (thêm vào `.gitignore`)
> - JWT_SECRET nên dài và random (>=32 ký tự)
> - MongoDB password không dùng ký tự đặc biệt để tránh lỗi URL encoding

### `backend/.gitignore`:
```
node_modules/
.env
```

---

## 19. Chạy dự án

### Backend:
```bash
cd backend
npm install
npm run dev
# → Server chạy tại http://localhost:5000
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
# → App chạy tại http://localhost:5173
```

### Tạo tài khoản admin (thủ công qua MongoDB Compass hoặc Atlas):
```js
// Vào MongoDB Atlas → Browse Collections → users
// Tìm user bạn vừa đăng ký → Edit → đổi role thành "admin"
// Hoặc dùng MongoDB Compass để update
```

### Seed dữ liệu sản phẩm mẫu (gọi API):
```bash
# Sau khi có tài khoản admin, dùng Postman hoặc Thunder Client:
POST http://localhost:5000/api/products
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "name": "Áo thun basic",
  "description": "Áo thun cotton 100%, thoáng mát",
  "price": 199000,
  "image": "https://picsum.photos/400/400?random=1",
  "category": "Thời trang",
  "stock": 50
}
```

---

## 20. Luồng hoạt động đầy đủ (để demo)

```
1. ĐĂNG KÝ
   User điền form → POST /api/auth/register
   → Backend: hash password → tạo User → tạo Cart rỗng → trả JWT
   → Frontend: lưu token vào localStorage → redirect về trang chủ

2. XEM SẢN PHẨM
   Trang chủ load → GET /api/products?page=1&limit=12
   → Hiển thị grid sản phẩm, có search/filter/phân trang

3. XEM CHI TIẾT
   Click ProductCard → navigate /products/:id
   → GET /api/products/:id → hiển thị thông tin đầy đủ

4. THÊM VÀO GIỎ
   Click "Thêm vào giỏ" → POST /api/cart/add { productId, quantity }
   → Backend: kiểm tra stock → thêm/update item trong Cart

5. GIỎ HÀNG
   → GET /api/cart → hiển thị items
   → Sửa số lượng: PUT /api/cart/update
   → Xóa item: DELETE /api/cart/remove

6. CHECKOUT
   Click "Thanh toán" → điền địa chỉ
   → POST /api/orders { shippingAddress }
   → Backend: query giá mới nhất → tạo snapshot → tạo Order → xóa Cart
   → Redirect sang trang Orders

7. LỊCH SỬ ĐƠN HÀNG
   → GET /api/orders/my → hiển thị danh sách orders với status

8. ADMIN (dùng tài khoản admin)
   → GET/POST/PUT/DELETE /api/products
   → CRUD sản phẩm trong bảng admin
```

---

## ĐIỂM QUAN TRỌNG ĐỂ GIẢI THÍCH KHI DEMO

| Câu hỏi giảng viên hay hỏi | Câu trả lời |
|---------------------------|-------------|
| Tại sao dùng JWT? | Stateless, không cần lưu session server, scalable |
| Tại sao hash password? | Nếu DB bị hack, password vẫn an toàn (bcrypt không thể reverse) |
| Snapshot trong Order là gì? | Lưu giá tại thời điểm mua, nếu admin đổi giá sau thì order cũ vẫn đúng |
| Xóa mềm (soft delete) là gì? | isActive=false thay vì xóa thật, tránh mất reference từ Order cũ |
| Cart và Order khác gì nhau? | Cart: tạm thời, có thể thay đổi; Order: vĩnh viễn, snapshot giá |
| CORS là gì? | Cơ chế bảo mật browser, cần enable để frontend và backend khác port giao tiếp được |
| Tại sao dùng MongoDB? | Schema linh hoạt, free cloud, dễ học với JS developer |
b
---

*Tài liệu được tạo ngày 2026-03-28 — Đầy đủ code + giải thích cho đồ án e-commerce.*

---

## TIẾN TRÌNH DỰ ÁN — CẬP NHẬT 2026-03-29

### Trạng thái hoàn thành

#### BACKEND

| Task | Nội dung | Trạng thái |
|------|----------|-----------|
| B1 | Setup Express, server.js, .env | ✅ Hoàn thành |
| B2 | Kết nối MongoDB Atlas (config/db.js) | ✅ Hoàn thành |
| B3 | Models: User, Product, Cart, Order, Review, Coupon, Category | ✅ Hoàn thành |
| B4 | Auth: register, login, admin-login (tách riêng), forgot/reset password, update profile | ✅ Hoàn thành |
| B5 | Product CRUD + search + filter giá + sort + phân trang + soft delete | ✅ Hoàn thành |
| B6 | Cart: add/update/remove | ✅ Hoàn thành |
| B7 | Order: tạo đơn, snapshot giá, trừ stock atomic, xem lịch sử, admin quản lý, user tự hủy đơn | ✅ Hoàn thành |
| B8 | Review: rating + comment, chỉ cho phép người đã mua (verified purchase) | ✅ Hoàn thành |
| B9 | Coupon: % và fixed, min order, max discount, hạn dùng | ✅ Hoàn thành |
| B10 | Category: CRUD danh mục, không xóa được nếu còn sản phẩm đang dùng | ✅ Hoàn thành |
| B11 | User management (admin): danh sách, khóa/mở tài khoản, đổi role | ✅ Hoàn thành |
| B12 | Email: gửi reset password, gửi xác nhận đơn hàng | ✅ Hoàn thành |

#### FRONTEND — User

| Task | Nội dung | Trạng thái |
|------|----------|-----------|
| F1 | Setup Vite React, axiosInstance, AuthContext, ToastContext, App.jsx Router | ✅ Hoàn thành |
| F2 | LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage | ✅ Hoàn thành |
| F3 | ProductListPage: grid + sidebar filter + search + sort + phân trang | ✅ Hoàn thành |
| F4 | ProductDetailPage: ảnh, thông tin, thêm giỏ, ReviewSection (rating + submit) | ✅ Hoàn thành |
| F5 | CartPage: danh sách, sửa số lượng, xóa, tổng tiền | ✅ Hoàn thành |
| F6 | CheckoutPage: địa chỉ, phương thức thanh toán (COD/chuyển khoản), nhập mã coupon | ✅ Hoàn thành |
| F7 | OrderHistoryPage: lịch sử đơn hàng, badge status, nút Hủy đơn (khi pending) | ✅ Hoàn thành |
| F8 | ProfilePage: cập nhật tên, đổi mật khẩu | ✅ Hoàn thành |
| F9 | ServicesPage: 6 thẻ dịch vụ + CTA banner | ✅ Hoàn thành |
| F10 | NewsPage: grid bài viết + filter tag + bài featured | ✅ Hoàn thành |
| F11 | FAQPage: accordion 4 nhóm câu hỏi | ✅ Hoàn thành |
| F12 | ContactPage: form liên hệ + thông tin + social | ✅ Hoàn thành |

#### FRONTEND — Admin

| Task | Nội dung | Trạng thái |
|------|----------|-----------|
| A1 | AdminLogin: trang đăng nhập riêng, gọi endpoint /auth/admin-login | ✅ Hoàn thành |
| A2 | AdminLayout: sidebar + topbar, menu điều hướng | ✅ Hoàn thành |
| A3 | AdminDashboard: thống kê doanh thu, đơn hàng, sản phẩm, user | ✅ Hoàn thành |
| A4 | AdminProductPage: CRUD sản phẩm, dropdown category từ API | ✅ Hoàn thành |
| A5 | AdminCategoryPage: CRUD danh mục, emoji picker chọn icon, toggle ẩn/hiện | ✅ Hoàn thành |
| A6 | AdminOrders: xem tất cả đơn hàng, cập nhật status, hoàn stock khi hủy | ✅ Hoàn thành |
| A7 | AdminUserPage: danh sách users, khóa/mở tài khoản, đổi role | ✅ Hoàn thành |

---

### Tính năng nâng cao đã thêm (ngoài yêu cầu gốc)

| Tính năng | Mô tả |
|-----------|-------|
| Search autocomplete | Gợi ý sản phẩm real-time khi gõ (debounce 300ms) |
| Navbar dropdown | Menu "Sản phẩm" có dropdown danh mục với icon |
| Sticky breadcrumb | Breadcrumb dính bên dưới navbar khi cuộn trang |
| Mã giảm giá (Coupon) | Hỗ trợ % và số tiền cố định, kiểm tra điều kiện đơn tối thiểu |
| Email tự động | Reset mật khẩu + xác nhận đơn hàng gửi qua email |
| Verified review | Chỉ người đã mua mới được đánh giá |
| Stock atomic | Dùng $inc thay vì read-modify-write, tránh race condition |
| Soft delete | Sản phẩm ẩn thay vì xóa thật, order cũ không bị ảnh hưởng |
| Admin/User tách biệt | 2 endpoint login riêng, chặn admin login qua giao diện user |
| User tự hủy đơn | Cho phép hủy khi status = pending, tự động hoàn stock |
| Toast notification | Thông báo thành công/lỗi toàn app |
| Banner carousel | Slider quảng cáo tự động trên trang chủ |

---

### Điểm số và định giá

| Tiêu chí | Điểm |
|----------|------|
| Chức năng | 8.5/10 |
| Kỹ thuật | 8.0/10 |
| UI/UX | 8.0/10 |
| **Tổng thể** | **8.2/10** |

**Định giá thị trường:**
- Thuê freelancer làm từ đầu: **20 – 35 triệu đồng**
- Bán template: **1 – 2 triệu đồng**
- Giá trị học thuật: tương đương **3–4 tháng** kinh nghiệm thực chiến

---

### Cấu trúc thư mục hiện tại (đầy đủ)

```
ecommerce/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── auth.controller.js       ← register, login, adminLogin, forgot/reset password
│   │   ├── cart.controller.js
│   │   ├── category.controller.js   ← CRUD danh mục [MỚI]
│   │   ├── coupon.controller.js     ← apply, CRUD coupon [MỚI]
│   │   ├── order.controller.js      ← tạo đơn, hủy đơn, admin quản lý
│   │   ├── product.controller.js
│   │   ├── review.controller.js     ← đánh giá verified purchase [MỚI]
│   │   └── user.controller.js       ← admin quản lý users [MỚI]
│   ├── middleware/
│   │   ├── auth.js
│   │   └── isAdmin.js
│   ├── models/
│   │   ├── Cart.js
│   │   ├── Category.js              ← [MỚI]
│   │   ├── Coupon.js                ← [MỚI]
│   │   ├── Order.js                 ← có paymentMethod, discount, couponCode
│   │   ├── Product.js
│   │   ├── Review.js                ← [MỚI]
│   │   └── User.js                  ← có isActive, resetPasswordToken
│   ├── routes/
│   │   ├── auth.routes.js           ← có /admin-login tách riêng
│   │   ├── cart.routes.js
│   │   ├── category.routes.js       ← [MỚI]
│   │   ├── coupon.routes.js         ← [MỚI]
│   │   ├── order.routes.js          ← có /:id/cancel cho user
│   │   ├── product.routes.js
│   │   ├── review.routes.js         ← [MỚI]
│   │   └── user.routes.js           ← [MỚI]
│   ├── utils/sendEmail.js
│   ├── seed.js
│   └── server.js
│
└── frontend/
    └── src/
        ├── api/axiosInstance.js
        ├── components/
        │   ├── Banner.jsx
        │   ├── Footer.jsx
        │   ├── Navbar.jsx            ← single bar + dropdown sản phẩm + search expandable
        │   ├── PrivateRoute.jsx
        │   └── ProductCard.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ToastContext.jsx
        ├── pages/
        │   ├── admin/
        │   │   ├── AdminCategoryPage.jsx  ← [MỚI]
        │   │   ├── AdminDashboard.jsx
        │   │   ├── AdminLayout.jsx
        │   │   ├── AdminLogin.jsx         ← gọi /auth/admin-login
        │   │   ├── AdminOrders.jsx
        │   │   ├── AdminProductPage.jsx   ← dropdown category từ API
        │   │   └── AdminUserPage.jsx
        │   ├── CartPage.jsx
        │   ├── CheckoutPage.jsx           ← có coupon + paymentMethod
        │   ├── ContactPage.jsx            ← [MỚI]
        │   ├── FAQPage.jsx               ← [MỚI]
        │   ├── ForgotPasswordPage.jsx
        │   ├── LoginPage.jsx              ← chặn admin login
        │   ├── NewsPage.jsx              ← [MỚI]
        │   ├── OrderHistoryPage.jsx       ← có nút Hủy đơn
        │   ├── ProductDetailPage.jsx      ← có ReviewSection
        │   ├── ProductListPage.jsx        ← sticky breadcrumb
        │   ├── ProfilePage.jsx
        │   ├── RegisterPage.jsx
        │   ├── ResetPasswordPage.jsx
        │   └── ServicesPage.jsx          ← [MỚI]
        ├── App.jsx
        └── index.css
```

---

### API Endpoints đầy đủ

#### Auth
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | /api/auth/register | ❌ | Đăng ký (tạo cart rỗng kèm theo) |
| POST | /api/auth/login | ❌ | Đăng nhập (chặn admin) |
| POST | /api/auth/admin-login | ❌ | Đăng nhập admin (chặn user thường) |
| POST | /api/auth/forgot-password | ❌ | Gửi email reset |
| POST | /api/auth/reset-password | ❌ | Đặt lại mật khẩu |
| PUT | /api/auth/profile | ✅ User | Cập nhật tên/mật khẩu |

#### Product
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | /api/products | ❌ | Danh sách (search, filter, sort, phân trang) |
| GET | /api/products/:id | ❌ | Chi tiết sản phẩm |
| POST | /api/products | ✅ Admin | Tạo sản phẩm |
| PUT | /api/products/:id | ✅ Admin | Cập nhật sản phẩm |
| DELETE | /api/products/:id | ✅ Admin | Xóa mềm sản phẩm |

#### Category
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | /api/categories | ❌ | Danh sách (?all=true cho admin) |
| POST | /api/categories | ✅ Admin | Tạo danh mục |
| PUT | /api/categories/:id | ✅ Admin | Cập nhật danh mục |
| DELETE | /api/categories/:id | ✅ Admin | Xóa (không xóa được nếu còn SP) |

#### Cart
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | /api/cart | ✅ User | Lấy giỏ hàng |
| POST | /api/cart/add | ✅ User | Thêm sản phẩm |
| PUT | /api/cart/update | ✅ User | Cập nhật số lượng |
| DELETE | /api/cart/remove | ✅ User | Xóa item |

#### Order
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | /api/orders | ✅ User | Tạo đơn hàng (checkout) |
| GET | /api/orders/my | ✅ User | Lịch sử đơn của tôi |
| PUT | /api/orders/:id/cancel | ✅ User | Hủy đơn pending (hoàn stock) |
| GET | /api/orders/all | ✅ Admin | Tất cả đơn hàng |
| PUT | /api/orders/:id/status | ✅ Admin | Cập nhật trạng thái |

#### Review
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | /api/products/:id/reviews | ❌ | Xem đánh giá + điểm TB |
| POST | /api/products/:id/reviews | ✅ User | Gửi đánh giá (phải đã mua) |

#### Coupon
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | /api/coupons/apply | ✅ User | Kiểm tra + tính giảm giá |
| GET | /api/coupons | ✅ Admin | Danh sách mã |
| POST | /api/coupons | ✅ Admin | Tạo mã |
| DELETE | /api/coupons/:id | ✅ Admin | Xóa mã |

#### User (Admin)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | /api/users | ✅ Admin | Danh sách users |
| GET | /api/users/:id | ✅ Admin | Chi tiết user |
| PUT | /api/users/:id/status | ✅ Admin | Khóa/mở tài khoản |
| PUT | /api/users/:id/role | ✅ Admin | Đổi role |

---

### Câu hỏi demo bổ sung (ngoài câu hỏi gốc)

| Câu hỏi | Câu trả lời |
|---------|-------------|
| Tại sao tách /admin-login riêng? | Bảo mật — ngăn user thường thử mật khẩu admin, ngăn autofill trình duyệt lộ thông tin |
| Coupon hoạt động thế nào? | Backend tính lại discount khi checkout, không tin tưởng số liệu từ frontend |
| Tại sao dùng $inc để trừ stock? | Atomic operation — tránh 2 request đồng thời đều đọc stock=1 rồi cùng đặt hàng thành công |
| User hủy đơn được không? | Chỉ hủy khi status=pending, backend tự hoàn stock về kho |
| Verified review là gì? | Kiểm tra Order của user có chứa sản phẩm đó và không bị hủy trước khi cho đánh giá |
| Soft delete category khác product thế nào? | Category isActive=false chỉ ẩn khỏi dropdown, không xóa được nếu còn sản phẩm đang dùng |

---

*Cập nhật lần cuối: 2026-03-29*
