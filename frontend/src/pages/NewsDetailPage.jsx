// NewsDetailPage.jsx — Trang đọc chi tiết bài viết

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const TAG_COLORS = {
  'Khuyến mãi': '#e8491d',
  'Xu hướng':   '#7c3aed',
  'Mẹo hay':    '#059669',
  'Thời trang': '#db2777',
  'Công nghệ':  '#0284c7',
  'Gia dụng':   '#d97706',
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [getting, setGetting] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    axiosInstance.get(`/news/${id}`)
      .then(async res => {
        const art = res.data.data;
        setArticle(art);
        // Nếu có mã voucher, tìm chi tiết voucher đó
        if (art.couponCode) {
          try {
            const cRes = await axiosInstance.get('/coupons/public');
            const found = cRes.data.data.find(c => c.code === art.couponCode);
            setCoupon(found);
          } catch (e) { console.error('Lỗi load voucher', e); }
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCollect = () => {
    setGetting(true);
    setTimeout(() => {
      setGetting(false);
      // Phát sự kiện để Navbar mở Ví Voucher
      window.dispatchEvent(new CustomEvent('OPEN_VOUCHER_WALLET'));
    }, 800);
  };

  if (loading) return (
    <div style={{ maxWidth: 800, margin: '80px auto', textAlign: 'center', color: '#94a3b8' }}>
      Đang tải...
    </div>
  );

  if (notFound || !article) return (
    <div style={{ maxWidth: 800, margin: '80px auto', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📰</div>
      <h2 style={{ color: '#1a1a2e', marginBottom: 8 }}>Không tìm thấy bài viết</h2>
      <button
        onClick={() => navigate('/news')}
        style={{ marginTop: 16, padding: '10px 28px', background: '#e8491d', color: '#fff', border: 'none', borderRadius: 24, cursor: 'pointer', fontWeight: 600 }}
      >← Quay lại tin tức</button>
    </div>
  );

  const tagColor = TAG_COLORS[article.category] || '#666';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px 60px' }}>

      {/* Thanh điều hướng: quay lại + chia sẻ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <button
          onClick={() => navigate('/news')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: '1.5px solid #e2e8f0',
            borderRadius: 20, padding: '7px 18px', cursor: 'pointer',
            fontSize: 13, color: '#64748b', fontWeight: 500,
          }}
        >← Quay lại tin tức</button>

        {/* Nút chia sẻ link */}
        <button
          onClick={handleShare}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: copied ? '#10b981' : '#f1f5f9',
            border: '1.5px solid', borderColor: copied ? '#10b981' : '#e2e8f0',
            borderRadius: 20, padding: '7px 18px', cursor: 'pointer',
            fontSize: 13, color: copied ? '#fff' : '#64748b', fontWeight: 500,
            transition: 'all .2s',
          }}
        >
          {copied ? '✅ Đã sao chép!' : '🔗 Chia sẻ link'}
        </button>
      </div>

      {/* Tag thể loại (Nhiều thẻ) */}
      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {Array.isArray(article.category) ? article.category.map(cat => (
          <span key={cat} style={{
            display: 'inline-block', background: (TAG_COLORS[cat] || '#666') + '18',
            color: TAG_COLORS[cat] || '#666', fontSize: 12, fontWeight: 700,
            padding: '4px 12px', borderRadius: 20,
          }}>{cat}</span>
        )) : (
          <span style={{
            display: 'inline-block', background: (TAG_COLORS[article.category] || '#666') + '18',
            color: TAG_COLORS[article.category] || '#666', fontSize: 12, fontWeight: 700,
            padding: '4px 12px', borderRadius: 20,
          }}>{article.category}</span>
        )}
      </div>

      {/* Tiêu đề */}
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.4, marginBottom: 16 }}>
        {article.title}
      </h1>

      {/* Meta */}
      <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#94a3b8', marginBottom: 28 }}>
        <span>📅 {formatDate(article.createdAt)}</span>
        <span>⏱ {article.readTime}</span>
      </div>

      {/* Ảnh bìa */}
      {article.image && (
        <img
          src={article.image}
          alt={article.title}
          style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 12, marginBottom: 32 }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}

      {/* Tóm tắt nổi bật */}
      {article.summary && (
        <div style={{
          background: tagColor + '0d', borderLeft: `4px solid ${tagColor}`,
          padding: '16px 20px', borderRadius: '0 10px 10px 0',
          fontSize: 16, color: '#374151', lineHeight: 1.7, marginBottom: 28,
          fontStyle: 'italic',
        }}>
          {article.summary}
        </div>
      )}

      {/* Nội dung đầy đủ */}
      {article.content ? (
        <div style={{
          fontSize: 15, lineHeight: 1.85, color: '#374151',
          whiteSpace: 'pre-wrap',
        }}>
          {article.content}
        </div>
      ) : (
        <div style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>
          Nội dung chi tiết đang được cập nhật...
        </div>
      )}

      {/* Voucher Box */}
      {coupon && (
        <div style={{
          marginTop: 40,
          background: 'linear-gradient(135deg, #fff 0%, #fffbf2 100%)',
          border: '2px dashed #f59e0b',
          borderRadius: 16,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.15)'
        }}>
          {/* Decor */}
          <div style={{ position: 'absolute', top: -10, left: -10, width: 24, height: 24, background: '#f59e0b', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: -10, right: -10, width: 24, height: 24, background: '#f59e0b', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -10, left: -10, width: 24, height: 24, background: '#f59e0b', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -10, right: -10, width: 24, height: 24, background: '#f59e0b', borderRadius: '50%' }} />

          <div style={{ fontSize: 32 }}>🎁</div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 4px', color: '#e8491d', fontSize: 18 }}>Ưu đãi độc quyền cho bạn!</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Dành riêng cho bạn đọc bài viết này</p>
          </div>

          <div style={{
            background: '#fff',
            border: '1.5px solid #fde68a',
            borderRadius: 12,
            padding: '12px 20px',
            width: '100%',
            maxWidth: 320,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>{coupon.code}</div>
              <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>
                {coupon.discountType === 'percent' ? `Giảm ${coupon.value}%` : `Giảm ${coupon.value.toLocaleString()}đ`}
              </div>
            </div>
            <button
              onClick={handleCollect}
              disabled={getting}
              style={{
                background: getting ? '#ccc' : '#e8491d',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 14,
                fontWeight: 700,
                cursor: getting ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseOver={e => !getting && (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseOut={e => !getting && (e.currentTarget.style.transform = 'scale(1)')}
            >
              {getting ? 'Đang nhận...' : 'Nhận mã'}
            </button>
          </div>
          
          <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
            * Áp dụng cho đơn hàng từ {coupon.minOrder.toLocaleString()}đ
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {Array.isArray(article.category) ? article.category.map(cat => (
            <span key={cat} style={{ 
              background: (TAG_COLORS[cat] || '#666') + '18', 
              color: TAG_COLORS[cat] || '#666', 
              padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 
            }}>
              {cat}
            </span>
          )) : (
             <span style={{ 
              background: (TAG_COLORS[article.category] || '#666') + '18', 
              color: TAG_COLORS[article.category] || '#666', 
              padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 
            }}>
              {article.category}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/news')}
          style={{ background: 'none', border: 'none', color: '#e8491d', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
        >← Xem tất cả tin tức</button>
      </div>
    </div>
  );
};

export default NewsDetailPage;
