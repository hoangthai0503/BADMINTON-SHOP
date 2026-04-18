# Chương 1: Giới thiệu đề tài

## 1.1 Lý do chọn đề tài

Thương mại điện tử (e-commerce) đang phát triển mạnh mẽ tại Việt Nam với tốc độ tăng trưởng trên 25%/năm. Nhu cầu mua sắm trực tuyến ngày càng tăng cao, đặc biệt sau đại dịch COVID-19. Việc xây dựng một hệ thống bán hàng trực tuyến không chỉ có giá trị thực tiễn mà còn giúp sinh viên nắm vững các kỹ năng phát triển web hiện đại theo mô hình full-stack.

Đề tài "Xây dựng website thương mại điện tử" được chọn vì:
- Tính ứng dụng thực tế cao, gần gũi với cuộc sống
- Bao gồm đầy đủ các nghiệp vụ phức tạp: xác thực, phân quyền, quản lý đơn hàng
- Cơ hội áp dụng stack công nghệ hiện đại (MERN Stack)

---

## 1.2 Mục tiêu đề tài

### Mục tiêu chính
Xây dựng website thương mại điện tử đầy đủ chức năng gồm:
- Hệ thống quản lý sản phẩm theo danh mục
- Chức năng mua sắm hoàn chỉnh (giỏ hàng → thanh toán → đơn hàng)
- Hệ thống quản trị (admin panel) để quản lý vận hành

### Mục tiêu kỹ thuật
- Áp dụng kiến trúc REST API tách biệt Frontend và Backend
- Triển khai xác thực bảo mật bằng JWT (JSON Web Token)
- Sử dụng MongoDB Atlas — cơ sở dữ liệu NoSQL trên cloud
- Xây dựng giao diện người dùng responsive với React

---

## 1.3 Phạm vi đề tài

### Trong phạm vi
| Chức năng | Mô tả |
|-----------|-------|
| Quản lý tài khoản | Đăng ký, đăng nhập, quên mật khẩu, cập nhật hồ sơ |
| Duyệt sản phẩm | Danh sách, tìm kiếm, lọc theo giá, lọc theo danh mục |
| Giỏ hàng | Thêm, sửa số lượng, xóa sản phẩm |
| Đặt hàng | Checkout với snapshot giá, hỗ trợ mã giảm giá |
| Thanh toán | COD và chuyển khoản ngân hàng |
| Đánh giá | Rating và nhận xét sản phẩm (chỉ người đã mua) |
| Admin | Quản lý sản phẩm, danh mục, đơn hàng, người dùng |

### Ngoài phạm vi
- Tích hợp cổng thanh toán thực tế (VNPay, Momo)
- Ứng dụng di động (mobile app)
- Chức năng chat/hỗ trợ trực tuyến real-time
- Hệ thống gợi ý sản phẩm bằng AI

---

## 1.4 Công nghệ sử dụng

| Tầng | Công nghệ | Phiên bản | Lý do chọn |
|------|-----------|-----------|------------|
| Frontend | React | 18.2.0 | Thư viện UI phổ biến nhất, component-based |
| Build tool | Vite | 5.x | Nhanh hơn CRA, hot reload tức thì |
| Routing | React Router | 6.20.0 | Routing chuẩn cho React SPA |
| HTTP Client | Axios | 1.6.2 | Interceptor, xử lý lỗi dễ dàng hơn fetch |
| Backend | Node.js + Express | 18.x + 4.18 | Nhẹ, nhanh, JS xuyên suốt |
| Database | MongoDB Atlas | 7.x | NoSQL linh hoạt, free tier cloud |
| ODM | Mongoose | 8.0.0 | Schema validation, middleware |
| Auth | JWT + bcryptjs | — | Stateless, không cần session server |
| Email | Nodemailer | — | Gửi email reset mật khẩu |

### Kiến trúc tổng thể
```
┌─────────────────────────────────────────────────┐
│                  CLIENT (Browser)                │
│            React SPA — localhost:5173            │
└─────────────────────┬───────────────────────────┘
                      │ HTTP/REST API (Axios)
                      │
┌─────────────────────▼───────────────────────────┐
│               BACKEND (Node.js)                  │
│          Express API — localhost:5000            │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Routes  │→ │Middleware│→ │  Controllers  │  │
│  └──────────┘  └──────────┘  └───────┬───────┘  │
└──────────────────────────────────────┼──────────┘
                                       │ Mongoose
┌──────────────────────────────────────▼──────────┐
│              MongoDB Atlas (Cloud)               │
│     users │ products │ orders │ cart │ ...       │
└─────────────────────────────────────────────────┘
```
