// ContactPage.jsx — Trang liên hệ

import { useState } from 'react';

const CONTACT_INFO = [
  { icon: '📞', label: 'Hotline', value: '1900 1234', sub: 'Miễn phí · 8:00 – 21:00 mỗi ngày' },
  { icon: '✉️', label: 'Email', value: 'support@eshop.vn', sub: 'Phản hồi trong 2–4 giờ làm việc' },
  { icon: '📍', label: 'Địa chỉ', value: '123 Nguyễn Huệ, Q.1, TP.HCM', sub: 'Thứ 2 – Thứ 7: 8:00 – 18:00' },
  { icon: '💬', label: 'Live Chat', value: 'Chat trực tuyến', sub: 'Phản hồi ngay trong vài giây' },
];

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Giả lập gửi form (demo — chưa kết nối backend)
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1a1a2e', marginBottom: 10 }}>Liên hệ với chúng tôi</h1>
        <p style={{ fontSize: 15, color: '#666', maxWidth: 500, margin: '0 auto' }}>
          Có câu hỏi hay cần hỗ trợ? Chúng tôi luôn ở đây để giúp bạn.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 40, alignItems: 'start' }}>

        {/* Left — Contact info */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            {CONTACT_INFO.map(info => (
              <div key={info.label} style={{
                display: 'flex', alignItems: 'flex-start', gap: 16,
                background: '#fff', padding: '18px 20px', borderRadius: 12,
                border: '1px solid #f0f0f0', boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
              }}>
                <div style={{
                  width: 44, height: 44, background: '#fff3ef', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>{info.icon}</div>
                <div>
                  <p style={{ fontSize: 12, color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>{info.label}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 2 }}>{info.value}</p>
                  <p style={{ fontSize: 12, color: '#888' }}>{info.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #f0f0f0' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 14 }}>THEO DÕI CHÚNG TÔI</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { name: 'Facebook', bg: '#1877f2', emoji: '📘' },
                { name: 'Instagram', bg: '#e4405f', emoji: '📸' },
                { name: 'TikTok', bg: '#010101', emoji: '🎵' },
                { name: 'YouTube', bg: '#ff0000', emoji: '▶️' },
              ].map(s => (
                <a key={s.name} href="#" title={s.name} style={{
                  width: 40, height: 40, background: s.bg, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, textDecoration: 'none',
                }}>{s.emoji}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Contact form */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: '32px 28px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0',
        }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10, color: '#1a1a2e' }}>Gửi thành công!</h3>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
                Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 2–4 giờ làm việc.
              </p>
              <button
                onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                style={{ padding: '10px 28px', background: '#e8491d', color: '#fff', border: 'none', borderRadius: 24, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
              >Gửi tin nhắn khác</button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, color: '#1a1a2e' }}>Gửi tin nhắn</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Họ và tên *</label>
                    <input
                      name="name" required value={form.name} onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = '#e8491d'}
                      onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Số điện thoại</label>
                    <input
                      name="phone" value={form.phone} onChange={handleChange}
                      placeholder="0901 234 567"
                      style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = '#e8491d'}
                      onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Email *</label>
                  <input
                    name="email" type="email" required value={form.email} onChange={handleChange}
                    placeholder="email@example.com"
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#e8491d'}
                    onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Chủ đề</label>
                  <select
                    name="subject" value={form.subject} onChange={handleChange}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', color: form.subject ? '#222' : '#aaa' }}
                  >
                    <option value="">-- Chọn chủ đề --</option>
                    <option>Hỏi về sản phẩm</option>
                    <option>Tình trạng đơn hàng</option>
                    <option>Đổi trả / Hoàn tiền</option>
                    <option>Góp ý / Khiếu nại</option>
                    <option>Hợp tác kinh doanh</option>
                    <option>Khác</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Nội dung *</label>
                  <textarea
                    name="message" required value={form.message} onChange={handleChange}
                    placeholder="Mô tả chi tiết vấn đề bạn cần hỗ trợ..."
                    rows={5}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical' }}
                    onFocus={e => e.target.style.borderColor = '#e8491d'}
                    onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <button
                  type="submit" disabled={loading}
                  style={{
                    padding: '13px', background: loading ? '#ccc' : '#e8491d', color: '#fff',
                    border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .2s',
                  }}
                >
                  {loading ? 'Đang gửi...' : 'Gửi tin nhắn →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Map placeholder */}
      <div style={{
        marginTop: 48, borderRadius: 14, overflow: 'hidden',
        border: '1px solid #e0e0e0', height: 280,
        background: 'linear-gradient(135deg, #f0f0f0, #e8e8e8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 10, color: '#999',
      }}>
        <span style={{ fontSize: 36 }}>🗺️</span>
        <p style={{ fontSize: 14 }}>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
        <a href="https://maps.google.com" target="_blank" rel="noreferrer"
          style={{ fontSize: 13, color: '#e8491d', fontWeight: 600 }}>
          Xem trên Google Maps →
        </a>
      </div>
    </div>
  );
};

export default ContactPage;
