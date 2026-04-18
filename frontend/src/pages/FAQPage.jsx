// FAQPage.jsx — Câu hỏi thường gặp (FAQ)

import { useState } from 'react';

const FAQ_DATA = [
  {
    group: 'Đặt hàng & Thanh toán',
    icon: '🛒',
    items: [
      {
        q: 'Làm thế nào để đặt hàng trên E-SHOP?',
        a: 'Bạn chọn sản phẩm → Thêm vào giỏ hàng → Vào trang Giỏ hàng → Nhấn "Thanh toán" → Điền địa chỉ và chọn phương thức thanh toán → Xác nhận đặt hàng. Rất đơn giản!',
      },
      {
        q: 'E-SHOP hỗ trợ những hình thức thanh toán nào?',
        a: 'Hiện tại chúng tôi hỗ trợ 2 hình thức: (1) COD — thanh toán tiền mặt khi nhận hàng, và (2) Chuyển khoản ngân hàng. Chúng tôi sẽ sớm tích hợp thêm ví điện tử và thẻ tín dụng.',
      },
      {
        q: 'Tôi có thể đặt hàng mà không cần tài khoản không?',
        a: 'Hiện tại bạn cần đăng ký tài khoản để đặt hàng. Việc này giúp bạn theo dõi đơn hàng, lưu lịch sử mua sắm và nhận ưu đãi thành viên dễ dàng hơn.',
      },
      {
        q: 'Tôi có thể thay đổi hoặc hủy đơn hàng sau khi đặt không?',
        a: 'Bạn có thể hủy đơn hàng đang ở trạng thái "Chờ xử lý" trực tiếp trong mục Lịch sử đơn hàng. Sau khi đơn được xác nhận/giao hàng, bạn cần liên hệ hotline để được hỗ trợ.',
      },
    ],
  },
  {
    group: 'Giao hàng & Vận chuyển',
    icon: '🚚',
    items: [
      {
        q: 'Thời gian giao hàng là bao lâu?',
        a: 'Nội thành TP.HCM và Hà Nội: 1–2 ngày làm việc. Các tỉnh thành khác: 3–5 ngày làm việc. Đơn hàng đặt trước 12:00 sẽ được ưu tiên xử lý trong ngày.',
      },
      {
        q: 'Phí vận chuyển được tính như thế nào?',
        a: 'Miễn phí giao hàng cho đơn từ 500.000đ. Đơn dưới 500.000đ: phí 30.000đ (nội thành) hoặc 40.000đ (ngoại thành, tỉnh). Một số sản phẩm cồng kềnh có thể phát sinh phụ phí.',
      },
      {
        q: 'Làm sao để theo dõi đơn hàng của tôi?',
        a: 'Vào mục "Đơn hàng" trên website để xem trạng thái đơn hàng. Bạn cũng sẽ nhận thông báo qua email ở mỗi bước xử lý đơn.',
      },
      {
        q: 'E-SHOP có giao hàng ra nước ngoài không?',
        a: 'Hiện tại chúng tôi chỉ giao hàng trong phạm vi lãnh thổ Việt Nam. Chúng tôi đang trong quá trình mở rộng ra các thị trường quốc tế — hãy theo dõi để không bỏ lỡ.',
      },
    ],
  },
  {
    group: 'Đổi trả & Hoàn tiền',
    icon: '🔄',
    items: [
      {
        q: 'Chính sách đổi trả của E-SHOP như thế nào?',
        a: 'Bạn có thể đổi trả sản phẩm trong vòng 30 ngày kể từ ngày nhận hàng với điều kiện: sản phẩm còn nguyên vẹn, chưa qua sử dụng, còn đầy đủ tem nhãn và hộp.',
      },
      {
        q: 'Tôi nhận được hàng bị lỗi, phải làm gì?',
        a: 'Vui lòng chụp ảnh/quay video sản phẩm lỗi và liên hệ hotline 1900 1234 trong vòng 48 giờ sau khi nhận hàng. Chúng tôi sẽ đổi sản phẩm mới hoặc hoàn tiền 100% cho bạn.',
      },
      {
        q: 'Thời gian hoàn tiền mất bao lâu?',
        a: 'Sau khi chúng tôi xác nhận đổi trả, tiền sẽ được hoàn trong vòng 3–5 ngày làm việc vào tài khoản ngân hàng hoặc ví điện tử của bạn.',
      },
    ],
  },
  {
    group: 'Tài khoản & Bảo mật',
    icon: '🔐',
    items: [
      {
        q: 'Tôi quên mật khẩu, phải làm gì?',
        a: 'Nhấp vào "Quên mật khẩu" trên trang đăng nhập, nhập email đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu vào email của bạn trong vài phút.',
      },
      {
        q: 'Thông tin cá nhân của tôi có được bảo mật không?',
        a: 'Tuyệt đối. Chúng tôi mã hóa toàn bộ dữ liệu và không chia sẻ thông tin cá nhân cho bên thứ ba. Xem thêm Chính sách bảo mật của chúng tôi để biết thêm chi tiết.',
      },
      {
        q: 'Tôi có thể thay đổi thông tin cá nhân không?',
        a: 'Có, bạn vào mục "Tài khoản" → "Chỉnh sửa thông tin" để cập nhật tên, email, số điện thoại và mật khẩu bất cứ lúc nào.',
      },
    ],
  },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: '1px solid', borderColor: open ? '#e8491d' : '#ececec',
      borderRadius: 10, overflow: 'hidden', transition: 'border-color .2s',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '16px 20px', background: open ? '#fff8f6' : '#fff',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
          transition: 'background .2s',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: open ? '#e8491d' : '#1a1a2e', lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color: '#e8491d', flexShrink: 0, fontWeight: 300 }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 20px 16px', background: '#fff8f6' }}>
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7 }}>{a}</p>
        </div>
      )}
    </div>
  );
};

const FAQPage = () => (
  <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 20px' }}>

    {/* Header */}
    <div style={{ textAlign: 'center', marginBottom: 48 }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1a1a2e', marginBottom: 10 }}>
        Câu hỏi thường gặp
      </h1>
      <p style={{ fontSize: 15, color: '#666' }}>
        Không tìm thấy câu trả lời? <a href="/contact" style={{ color: '#e8491d', fontWeight: 600 }}>Liên hệ với chúng tôi</a>
      </p>
    </div>

    {/* FAQ groups */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {FAQ_DATA.map(group => (
        <div key={group.group}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a2e', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{group.icon}</span> {group.group}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {group.items.map(item => <FAQItem key={item.q} {...item} />)}
          </div>
        </div>
      ))}
    </div>

    {/* Still need help */}
    <div style={{
      marginTop: 56, background: '#f8f9fa', borderRadius: 14,
      padding: '32px 28px', textAlign: 'center', border: '1px solid #ececec',
    }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🤔</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Vẫn còn thắc mắc?</h3>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
        Đội ngũ hỗ trợ của chúng tôi sẵn sàng giải đáp mọi câu hỏi.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="tel:19001234" style={{
          padding: '10px 24px', background: '#e8491d', color: '#fff',
          borderRadius: 24, fontSize: 13, fontWeight: 600,
        }}>📞 Gọi 1900 1234</a>
        <a href="/contact" style={{
          padding: '10px 24px', border: '1.5px solid #e8491d', color: '#e8491d',
          borderRadius: 24, fontSize: 13, fontWeight: 600, background: '#fff',
        }}>✉️ Gửi tin nhắn</a>
      </div>
    </div>
  </div>
);

export default FAQPage;
