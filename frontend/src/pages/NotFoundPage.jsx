// NotFoundPage.jsx — Trang 404 khi URL không tồn tại

import { Link, useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '70vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 96, lineHeight: 1, marginBottom: 16 }}>🔍</div>
      <h1 style={{ fontSize: 80, fontWeight: 900, color: '#e8491d', lineHeight: 1, margin: 0 }}>404</h1>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: '12px 0 8px' }}>
        Trang không tồn tại
      </h2>
      <p style={{ fontSize: 15, color: '#888', maxWidth: 380, lineHeight: 1.6, marginBottom: 32 }}>
        Trang bạn đang tìm kiếm đã bị xóa, đổi tên hoặc chưa bao giờ tồn tại.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '11px 24px', border: '1.5px solid #e8491d', borderRadius: 24,
            background: 'transparent', color: '#e8491d', fontWeight: 600,
            fontSize: 14, cursor: 'pointer',
          }}
        >← Quay lại</button>
        <Link to="/" style={{
          padding: '11px 24px', background: '#e8491d', borderRadius: 24,
          color: '#fff', fontWeight: 600, fontSize: 14,
        }}>
          Về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
