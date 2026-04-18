// utils/sendEmail.js — Gửi email xác nhận đơn hàng bằng Nodemailer
//
// Chế độ hoạt động:
//   - Nếu có EMAIL_USER + EMAIL_PASS trong .env → dùng Gmail SMTP thật
//   - Nếu không → dùng Ethereal (SMTP test, link xem email hiện trên terminal)

const nodemailer = require('nodemailer');

// Tạo transporter (kết nối SMTP Gmail)
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Chưa cấu hình EMAIL_USER và EMAIL_PASS trong .env');
  }

  // Dùng Gmail SMTP trực tiếp thay vì service shorthand (tương thích nodemailer v8)
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Format tiền VND
const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

// Tạo nội dung HTML cho email xác nhận
const buildOrderEmailHtml = (order, userName) => {
  const itemRows = order.items.map(item => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;">
        <strong>${item.name}</strong>
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:center;">
        x${item.quantity}
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:right;color:#e8491d;font-weight:700;">
        ${fmt(item.price * item.quantity)}
      </td>
    </tr>
  `).join('');

  const orderId = order._id.toString().slice(-8).toUpperCase();
  const orderDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#333;">

  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#e8491d;padding:28px 32px;text-align:center;">
      <p style="color:rgba(255,255,255,0.8);margin:0 0 4px;font-size:13px;letter-spacing:1px;">E-SHOP</p>
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;">Đặt hàng thành công! 🎉</h1>
    </div>

    <!-- Lời chào -->
    <div style="padding:28px 32px 0;">
      <p style="font-size:15px;margin:0 0 8px;">Xin chào <strong>${userName}</strong>,</p>
      <p style="color:#555;line-height:1.6;margin:0;">
        Cảm ơn bạn đã mua sắm tại <strong>E-SHOP</strong>! Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.
      </p>
    </div>

    <!-- Thông tin đơn hàng -->
    <div style="padding:20px 32px;">
      <div style="background:#f8f8f8;border-radius:6px;padding:16px 20px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div>
          <p style="margin:0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">Mã đơn hàng</p>
          <p style="margin:4px 0 0;font-weight:800;font-size:16px;color:#1a1a2e;">#${orderId}</p>
        </div>
        <div>
          <p style="margin:0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">Ngày đặt</p>
          <p style="margin:4px 0 0;font-weight:600;">${orderDate}</p>
        </div>
        <div>
          <p style="margin:0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">Trạng thái</p>
          <p style="margin:4px 0 0;"><span style="background:#fef3c7;color:#92400e;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">Chờ xử lý</span></p>
        </div>
      </div>
    </div>

    <!-- Danh sách sản phẩm -->
    <div style="padding:0 32px 20px;">
      <h3 style="font-size:14px;font-weight:700;color:#1a1a2e;margin:0 0 12px;text-transform:uppercase;letter-spacing:.5px;">Sản phẩm đặt mua</h3>
      <table style="width:100%;border-collapse:collapse;background:#fafafa;border-radius:6px;overflow:hidden;">
        <thead>
          <tr style="background:#1a1a2e;">
            <th style="padding:10px 14px;text-align:left;color:#fff;font-size:12px;font-weight:600;">Sản phẩm</th>
            <th style="padding:10px 14px;text-align:center;color:#fff;font-size:12px;font-weight:600;">SL</th>
            <th style="padding:10px 14px;text-align:right;color:#fff;font-size:12px;font-weight:600;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px 14px;font-weight:700;font-size:15px;border-top:2px solid #e0e0e0;">Tổng cộng</td>
            <td style="padding:12px 14px;text-align:right;font-weight:800;font-size:17px;color:#e8491d;border-top:2px solid #e0e0e0;">${fmt(order.totalPrice)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Địa chỉ giao hàng -->
    <div style="padding:0 32px 28px;">
      <h3 style="font-size:14px;font-weight:700;color:#1a1a2e;margin:0 0 10px;text-transform:uppercase;letter-spacing:.5px;">Địa chỉ giao hàng</h3>
      <div style="background:#f8f8f8;border-left:3px solid #e8491d;padding:12px 16px;border-radius:0 6px 6px 0;color:#555;line-height:1.6;">
        ${order.shippingAddress}
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8f8f8;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
      <p style="margin:0 0 6px;color:#888;font-size:12.5px;">Nếu cần hỗ trợ, liên hệ hotline: <strong style="color:#e8491d;">1900 1234</strong></p>
      <p style="margin:0;color:#bbb;font-size:11.5px;">© 2025 E-SHOP — Cảm ơn bạn đã tin tưởng mua sắm</p>
    </div>

  </div>
</body>
</html>
  `.trim();
};

// Hàm chính: gửi email xác nhận đơn hàng
const sendOrderConfirmEmail = async ({ toEmail, userName, order }) => {
  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"E-SHOP" <${process.env.EMAIL_USER || 'noreply@eshop.vn'}>`,
      to: toEmail,
      subject: `[E-SHOP] Xác nhận đơn hàng #${order._id.toString().slice(-8).toUpperCase()}`,
      html: buildOrderEmailHtml(order, userName),
    });

    // Nếu dùng Ethereal → in link xem email ra terminal
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧 Email xác nhận đã gửi (Ethereal preview): ${previewUrl}`);
    } else {
      console.log(`📧 Email xác nhận đã gửi tới: ${toEmail}`);
    }
  } catch (err) {
    // Không throw — lỗi email không được làm hỏng luồng đặt hàng
    console.error('⚠️  Gửi email thất bại (đơn hàng vẫn được tạo):', err.message);
  }
};

// Tạo nội dung HTML cho email reset password
const buildResetPasswordEmailHtml = (userName, resetLink) => {
  return `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#333;">

  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#e8491d;padding:28px 32px;text-align:center;">
      <p style="color:rgba(255,255,255,0.8);margin:0 0 4px;font-size:13px;letter-spacing:1px;">E-SHOP</p>
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;">Đặt lại mật khẩu 🔐</h1>
    </div>

    <!-- Lời chào -->
    <div style="padding:28px 32px 0;">
      <p style="font-size:15px;margin:0 0 8px;">Xin chào <strong>${userName}</strong>,</p>
      <p style="color:#555;line-height:1.6;margin:0;">
        Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
        Nhấn nút bên dưới để tạo mật khẩu mới.
      </p>
    </div>

    <!-- Link action -->
    <div style="padding:28px 32px;">
      <a href="${resetLink}" style="display:inline-block;background:#e8491d;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:700;font-size:15px;">
        Đặt lại mật khẩu
      </a>
      <p style="color:#888;font-size:12px;margin:16px 0 0;">Hoặc sao chép link này vào trình duyệt:</p>
      <p style="background:#f8f8f8;padding:12px;border-radius:4px;word-break:break-all;color:#555;font-size:12px;margin:8px 0;">
        ${resetLink}
      </p>
    </div>

    <!-- Cảnh báo -->
    <div style="padding:0 32px 28px;">
      <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 6px 6px 0;">
        <p style="margin:0;color:#92400e;font-size:13px;">
          <strong>⏰ Lưu ý:</strong> Link này sẽ hết hạn sau 1 giờ.
          Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8f8f8;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
      <p style="margin:0 0 6px;color:#888;font-size:12.5px;">Nếu cần hỗ trợ, liên hệ hotline: <strong style="color:#e8491d;">1900 1234</strong></p>
      <p style="margin:0;color:#bbb;font-size:11.5px;">© 2025 E-SHOP — An toàn là ưu tiên hàng đầu của chúng tôi</p>
    </div>

  </div>
</body>
</html>
  `.trim();
};

// Hàm gửi email reset password
const sendResetPasswordEmail = async ({ toEmail, userName, resetLink }) => {
  try {
    console.log('🔧 DEBUG: Bắt đầu gửi reset password email...');
    const transporter = createTransporter();
    console.log('🔧 DEBUG: Transporter đã tạo');

    const info = await transporter.sendMail({
      from: `"E-SHOP" <${process.env.EMAIL_USER || 'noreply@eshop.vn'}>`,
      to: toEmail,
      subject: '[E-SHOP] Đặt lại mật khẩu của bạn',
      html: buildResetPasswordEmailHtml(userName, resetLink),
    });
    console.log('🔧 DEBUG: Email đã gửi qua transporter, response:', info.messageId);

    // Nếu dùng Ethereal → in link xem email ra terminal
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('🔧 DEBUG: previewUrl =', previewUrl);
    if (previewUrl) {
      console.log(`📧 Email reset password đã gửi (Ethereal preview): ${previewUrl}`);
    } else {
      console.log(`📧 Email reset password đã gửi tới: ${toEmail}`);
    }
  } catch (err) {
    // Không throw — lỗi email không được làm hỏng luồng forget password
    console.error('⚠️  Gửi email thất bại:', err.message);
    console.error('❌ Stack trace:', err.stack);
  }
};

// Tạo nội dung HTML cho email chào mừng khi đăng ký
const buildWelcomeEmailHtml = (userName) => `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#333;">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#e8491d;padding:36px 32px;text-align:center;">
      <p style="color:rgba(255,255,255,0.8);margin:0 0 6px;font-size:13px;letter-spacing:1px;">E-SHOP</p>
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">Chào mừng bạn! 🎉</h1>
    </div>

    <!-- Nội dung -->
    <div style="padding:32px 32px 24px;">
      <p style="font-size:16px;margin:0 0 12px;">Xin chào <strong>${userName}</strong>,</p>
      <p style="color:#555;line-height:1.7;margin:0 0 20px;">
        Tài khoản của bạn đã được tạo thành công tại <strong>E-SHOP</strong>.
        Bây giờ bạn có thể khám phá hàng ngàn sản phẩm và mua sắm dễ dàng hơn bao giờ hết!
      </p>

      <!-- Các tính năng nổi bật -->
      <div style="background:#f8f8f8;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-weight:700;color:#1a1a2e;">Bạn có thể:</p>
        <p style="margin:0 0 8px;color:#555;">🛍️ Mua sắm với hàng nghìn sản phẩm đa dạng</p>
        <p style="margin:0 0 8px;color:#555;">🏷️ Nhận ưu đãi và mã giảm giá hấp dẫn</p>
        <p style="margin:0 0 8px;color:#555;">📦 Theo dõi đơn hàng theo thời gian thực</p>
        <p style="margin:0;color:#555;">⭐ Đánh giá sản phẩm sau khi mua</p>
      </div>

      <!-- CTA -->
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}"
        style="display:inline-block;background:#e8491d;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:700;font-size:15px;">
        Bắt đầu mua sắm →
      </a>
    </div>

    <!-- Footer -->
    <div style="background:#f8f8f8;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
      <p style="margin:0 0 6px;color:#888;font-size:12.5px;">Nếu cần hỗ trợ, liên hệ hotline: <strong style="color:#e8491d;">1900 1234</strong></p>
      <p style="margin:0;color:#bbb;font-size:11.5px;">© 2025 E-SHOP — Cảm ơn bạn đã tin tưởng</p>
    </div>

  </div>
</body>
</html>
`.trim();

// Hàm gửi email chào mừng sau khi đăng ký
const sendWelcomeEmail = async ({ toEmail, userName }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"E-SHOP" <${process.env.EMAIL_USER || 'noreply@eshop.vn'}>`,
      to: toEmail,
      subject: '[E-SHOP] Chào mừng bạn đến với E-SHOP! 🎉',
      html: buildWelcomeEmailHtml(userName),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧 Email chào mừng (Ethereal preview): ${previewUrl}`);
    } else {
      console.log(`📧 Email chào mừng đã gửi tới: ${toEmail}`);
    }
  } catch (err) {
    // Không throw — lỗi email không được làm hỏng luồng đăng ký
    console.error('⚠️  Gửi email chào mừng thất bại:', err.message);
  }
};

module.exports = { sendOrderConfirmEmail, sendResetPasswordEmail, sendWelcomeEmail };
