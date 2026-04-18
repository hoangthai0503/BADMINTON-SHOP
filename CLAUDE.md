# 🛒 E-commerce Web App — Claude Code Instructions

## 🎯 Mục tiêu dự án
Xây dựng đồ án web e-commerce mức trung bình (hướng tới 8 điểm), đủ để demo trước giảng viên. Ưu tiên: đơn giản, dễ hiểu, dễ demo — không over-engineering.

---

## ⚙️ Tech Stack
- **Frontend**: React (Vite) + React Router + Axios
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas + Mongoose
- **Auth**: JWT + bcryptjs

---

## 📁 Cấu trúc thư mục

```
ecommerce/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── isAdmin.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── cart.controller.js
│   │   └── order.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── cart.routes.js
│   │   └── order.routes.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axiosInstance.js
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProductCard.jsx
    │   │   └── PrivateRoute.jsx
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
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## 🗄️ Database Schema

### User
```js
{
  name: String,
  email: { type: String, unique: true },
  password: String,        // hashed bằng bcrypt
  role: { type: String, default: 'user' },  // 'user' | 'admin'
  createdAt: Date
}
```

### Product
```js
{
  name: String,
  description: String,
  price: Number,
  image: String,           // URL
  category: String,
  stock: Number,
  isActive: { type: Boolean, default: true },
  createdAt: Date
}
```

### Cart
```js
{
  userId: { type: ObjectId, ref: 'User', unique: true },
  items: [{
    productId: { type: ObjectId, ref: 'Product' },
    name: String,          // cache
    price: Number,         // cache
    image: String,         // cache
    quantity: Number
  }],
  updatedAt: Date
}
```

### Order
```js
{
  userId: { type: ObjectId, ref: 'User' },
  items: [{
    productId: ObjectId,
    name: String,          // SNAPSHOT
    price: Number,         // SNAPSHOT — giá lúc mua
    image: String,         // SNAPSHOT
    quantity: Number
  }],
  totalPrice: Number,
  status: { type: String, default: 'pending' },  // 'pending' | 'paid' | 'cancelled'
  shippingAddress: String,
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /api/auth/register | ❌ |
| POST | /api/auth/login | ❌ |

### Product
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /api/products | ❌ |
| GET | /api/products/:id | ❌ |
| POST | /api/products | ✅ Admin |
| PUT | /api/products/:id | ✅ Admin |
| DELETE | /api/products/:id | ✅ Admin |

**Query params cho GET /api/products:**
- `page`, `limit` — phân trang
- `search` — tìm theo tên (regex, case-insensitive)
- `minPrice`, `maxPrice` — lọc giá
- `sort` — `price_asc` | `price_desc`

### Cart (cần JWT)
| Method | Endpoint |
|--------|----------|
| GET | /api/cart |
| POST | /api/cart/add |
| PUT | /api/cart/update |
| DELETE | /api/cart/remove |

### Order (cần JWT)
| Method | Endpoint |
|--------|----------|
| POST | /api/orders |
| GET | /api/orders/my |

---

## ⚙️ Logic quan trọng

### Checkout (POST /api/orders)
1. Lấy Cart của user
2. Với mỗi item: query lại Product để lấy **giá mới nhất**
3. Build snapshot items (name, price, image từ Product — không từ Cart)
4. Tính totalPrice từ snapshot
5. Tạo Order với status: 'pending'
6. Xóa sạch cart.items = []
7. Trả về order

> ⚠️ Lý do snapshot: nếu Admin đổi giá sau khi user bỏ vào giỏ, Order phải lưu giá tại thời điểm checkout — không phải giá hiện tại hay giá cache trong Cart.

### Register
1. Kiểm tra email đã tồn tại
2. Hash password bằng bcrypt (saltRounds: 10)
3. Tạo User
4. Tạo Cart rỗng cho user luôn
5. Ký JWT, trả về token + user info

---

## 🔐 Middleware

### auth.js
- Đọc token từ header `Authorization: Bearer <token>`
- Verify bằng `jwt.verify(token, process.env.JWT_SECRET)`
- Gắn `req.user = { userId, role }`

### isAdmin.js
- Kiểm tra `req.user.role === 'admin'`
- Trả 403 nếu không phải admin

---

## 📝 Nguyên tắc code

- Mọi file đều có **comment tiếng Việt** giải thích logic
- Response format thống nhất:
  ```json
  { "success": true, "message": "...", "data": {} }
  ```
- Dùng `try/catch` trong mọi controller
- Không over-engineering: không dùng Redis, không dùng TypeScript, không dùng Docker
- Frontend dùng **inline style hoặc CSS module** — không cần Tailwind hay UI library

---

## 🌿 Biến môi trường (.env)

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ecommerce
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

---

## 📦 Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "dotenv": "^16.3.1",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.2"
}
```

---

## ✅ Thứ tự thực hiện

Thực hiện **tuần tự từng task**, sau mỗi task dừng lại và thông báo hoàn thành:

```
B1 → B2 → B3 → B4 → B5 → B6 → B7
                              ↓
F1 → F2 → F3 → F4 → F5 → F6
```

### Backend Tasks
- **B1** — Setup Express: init project, cài dependencies, server.js, .env mẫu
- **B2** — MongoDB: config/db.js, kết nối Atlas
- **B3** — Models: User, Product, Cart, Order
- **B4** — Auth: middleware/auth.js, auth.controller.js, auth.routes.js
- **B5** — Product CRUD: middleware/isAdmin.js, product.controller.js, product.routes.js
- **B6** — Cart: cart.controller.js, cart.routes.js
- **B7** — Order: order.controller.js, order.routes.js

### Frontend Tasks
- **F1** — Setup Vite React: axiosInstance.js, AuthContext.jsx, App.jsx với Router
- **F2** — Auth UI: LoginPage.jsx, RegisterPage.jsx
- **F3** — Product: ProductListPage.jsx, ProductDetailPage.jsx, ProductCard.jsx
- **F4** — Cart: CartPage.jsx
- **F5** — Checkout + Orders: CheckoutPage.jsx, OrderHistoryPage.jsx
- **F6** — Admin: AdminProductPage.jsx (CRUD table)

---

## 🚀 Lệnh khởi động

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

---

## 🎁 Sau khi hoàn thành

Gợi ý 2 tính năng nâng cao dễ làm, ăn điểm:
1. **Đánh giá sản phẩm** (rating 1-5 sao + comment) — thêm Reviews collection
2. **Dashboard admin** (tổng doanh thu, số đơn hàng theo ngày) — aggregate MongoDB

Deploy miễn phí:
- Backend → Render.com
- Frontend → Vercel.com

---

*File này được tạo để Claude Code đọc và tự động thực hiện từng task theo thứ tự.*
