// ServicesPage.jsx — Trang dịch vụ

const services = [
  {
    icon: '🚚',
    title: 'Giao hàng nhanh',
    desc: 'Giao hàng toàn quốc trong 2–5 ngày làm việc. Nội thành TP.HCM và Hà Nội giao trong ngày với đơn đặt trước 12:00.',
    detail: ['Miễn phí giao hàng cho đơn từ 500.000đ', 'Theo dõi đơn hàng real-time', 'Đóng gói cẩn thận, chắc chắn'],
  },
  {
    icon: '🔄',
    title: 'Đổi trả dễ dàng',
    desc: 'Chính sách đổi trả trong vòng 30 ngày kể từ ngày nhận hàng. Không cần lý do, hoàn tiền 100%.',
    detail: ['30 ngày đổi trả miễn phí', 'Hoàn tiền trong 3–5 ngày làm việc', 'Hỗ trợ đổi size/màu trực tiếp'],
  },
  {
    icon: '🛡️',
    title: 'Bảo hành chính hãng',
    desc: 'Tất cả sản phẩm điện tử được bảo hành theo chính sách nhà sản xuất. Hỗ trợ bảo hành tại cửa hàng.',
    detail: ['Bảo hành 12–24 tháng tùy sản phẩm', 'Trung tâm bảo hành trên toàn quốc', 'Hỗ trợ kỹ thuật 24/7'],
  },
  {
    icon: '💳',
    title: 'Thanh toán linh hoạt',
    desc: 'Hỗ trợ nhiều hình thức thanh toán: COD, chuyển khoản, thẻ tín dụng, ví điện tử.',
    detail: ['Thanh toán khi nhận hàng (COD)', 'Chuyển khoản ngân hàng', 'Trả góp 0% lãi suất qua thẻ'],
  },
  {
    icon: '🎁',
    title: 'Ưu đãi thành viên',
    desc: 'Tích điểm mỗi đơn hàng, đổi điểm lấy voucher giảm giá. Thành viên VIP nhận ưu đãi đặc biệt hàng tháng.',
    detail: ['1.000đ = 1 điểm thưởng', 'Sinh nhật tặng voucher 10%', 'Flash sale riêng cho thành viên'],
  },
  {
    icon: '📞',
    title: 'Hỗ trợ 24/7',
    desc: 'Đội ngũ CSKH luôn sẵn sàng hỗ trợ qua hotline, chat trực tuyến và email.',
    detail: ['Hotline: 1900 1234 (miễn phí)', 'Chat trực tuyến trên website', 'Email: support@eshop.vn'],
  },
];

const ServicesPage = () => (
  <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>

    {/* Hero */}
    <div style={{ textAlign: 'center', marginBottom: 48 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1a1a2e', marginBottom: 12 }}>
        Dịch vụ của chúng tôi
      </h1>
      <p style={{ fontSize: 16, color: '#666', maxWidth: 560, margin: '0 auto' }}>
        E-SHOP cam kết mang đến trải nghiệm mua sắm tốt nhất — từ lúc đặt hàng đến khi sản phẩm đến tay bạn.
      </p>
    </div>

    {/* Service cards */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, marginBottom: 56 }}>
      {services.map((s) => (
        <div key={s.title} style={{
          background: '#fff', borderRadius: 12, padding: '28px 24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0',
          transition: 'transform .2s, box-shadow .2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
        >
          <div style={{ fontSize: 40, marginBottom: 16 }}>{s.icon}</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#1a1a2e' }}>{s.title}</h3>
          <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 16 }}>{s.desc}</p>
          <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {s.detail.map(d => (
              <li key={d} style={{ fontSize: 13, color: '#444', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#e8491d', fontWeight: 700 }}>✓</span> {d}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    {/* CTA banner */}
    <div style={{
      background: 'linear-gradient(135deg, #e8491d 0%, #ff6b35 100%)',
      borderRadius: 16, padding: '40px 32px', textAlign: 'center', color: '#fff',
    }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>Cần hỗ trợ thêm?</h2>
      <p style={{ fontSize: 15, opacity: 0.9, marginBottom: 24 }}>
        Đội ngũ của chúng tôi luôn sẵn sàng giúp đỡ bạn mọi lúc mọi nơi.
      </p>
      <a href="/contact" style={{
        display: 'inline-block', background: '#fff', color: '#e8491d',
        fontWeight: 700, padding: '12px 32px', borderRadius: 30, fontSize: 14,
      }}>
        Liên hệ ngay
      </a>
    </div>
  </div>
);

export default ServicesPage;
