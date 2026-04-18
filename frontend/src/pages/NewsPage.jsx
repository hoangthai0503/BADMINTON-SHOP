// NewsPage.jsx — Trang tin tức / blog (dữ liệu từ DB)

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const TAGS = ['Tất cả', 'Khuyến mãi', 'Xu hướng', 'Mẹo hay', 'Thời trang', 'Công nghệ', 'Gia dụng'];

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

const NewsPage = () => {
  const [activeTag, setActiveTag] = useState('Tất cả');
  const [allNews, setAllNews]     = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    axiosInstance.get('/news', { params: { limit: 50 } })
      .then(res => setAllNews(res.data.data.news || []))
      .catch(() => setAllNews([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeTag === 'Tất cả'
    ? allNews
    : allNews.filter(n => Array.isArray(n.category) ? n.category.includes(activeTag) : n.category === activeTag);

  const featured = allNews.find(n => n.isFeatured);
  const rest = activeTag === 'Tất cả'
    ? allNews.filter(n => !n.isFeatured)
    : filtered;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1a1a2e', marginBottom: 8 }}>Tin tức & Blog</h1>
        <p style={{ color: '#666', fontSize: 15 }}>Cập nhật xu hướng mua sắm, mẹo hay và khuyến mãi mới nhất.</p>
      </div>

      {/* Tag filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
        {TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            style={{
              padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              border: '1.5px solid', transition: 'all .15s',
              borderColor: activeTag === tag ? '#e8491d' : '#e0e0e0',
              background: activeTag === tag ? '#e8491d' : '#fff',
              color: activeTag === tag ? '#fff' : '#555',
            }}
          >{tag}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Đang tải...</div>
      ) : allNews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📰</div>
          <p>Chưa có bài viết nào.</p>
        </div>
      ) : (
        <>
          {/* Bài viết nổi bật (chỉ hiện khi ở tab Tất cả) */}
          {activeTag === 'Tất cả' && featured && (
            <Link
              to={`/news/${featured._id}`}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
                background: '#fff', borderRadius: 14, overflow: 'hidden',
                boxShadow: '0 2px 16px rgba(0,0,0,0.09)', marginBottom: 36,
                border: '1px solid #f0f0f0', textDecoration: 'none', color: 'inherit',
                cursor: 'pointer',
              }}>
              <img
                src={featured.image || 'https://picsum.photos/seed/featured/600/340'}
                alt={featured.title}
                style={{ width: '100%', height: 280, objectFit: 'cover' }}
                onError={e => { e.target.src = 'https://picsum.photos/seed/featured/600/340'; }}
              />
              <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {Array.isArray(featured.category) ? featured.category.map(cat => (
                    <span key={cat} style={{
                      display: 'inline-block',
                      background: (TAG_COLORS[cat] || '#666') + '18',
                      color: TAG_COLORS[cat] || '#666',
                      fontSize: 12, fontWeight: 700, padding: '3px 10px',
                      borderRadius: 20,
                    }}>{cat}</span>
                  )) : (
                    <span style={{
                      display: 'inline-block',
                      background: (TAG_COLORS[featured.category] || '#666') + '18',
                      color: TAG_COLORS[featured.category] || '#666',
                      fontSize: 12, fontWeight: 700, padding: '3px 10px',
                      borderRadius: 20,
                    }}>{featured.category}</span>
                  )}
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.4, marginBottom: 12 }}>
                  {featured.title}
                </h2>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 20 }}>{featured.summary}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#999', marginBottom: 20 }}>
                  <span>📅 {formatDate(featured.createdAt)}</span>
                  <span>⏱ {featured.readTime}</span>
                </div>
                <span style={{
                  alignSelf: 'flex-start', padding: '10px 22px', background: '#e8491d',
                  color: '#fff', borderRadius: 24, fontSize: 13, fontWeight: 600,
                }}>Đọc tiếp →</span>
              </div>
            </Link>
          )}

          {/* Lưới bài viết */}
          {rest.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Không có bài viết nào trong thể loại này.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {rest.map(news => (
                <Link
                  key={news._id}
                  to={`/news/${news._id}`}
                  style={{
                    display: 'block', textDecoration: 'none', color: 'inherit',
                    background: '#fff', borderRadius: 12, overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0',
                    transition: 'transform .2s, box-shadow .2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.07)'; }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={news.image || `https://picsum.photos/seed/${news._id}/600/340`}
                      alt={news.title}
                      style={{ width: '100%', height: 190, objectFit: 'cover' }}
                      onError={e => { e.target.src = `https://picsum.photos/seed/${news._id}/600/340`; }}
                    />
                    <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {Array.isArray(news.category) ? news.category.map(cat => (
                        <span key={cat} style={{
                          background: TAG_COLORS[cat] || '#666',
                          color: '#fff', fontSize: 10, fontWeight: 700,
                          padding: '2px 8px', borderRadius: 20,
                        }}>{cat}</span>
                      )) : (
                        <span style={{
                          background: TAG_COLORS[news.category] || '#666',
                          color: '#fff', fontSize: 10, fontWeight: 700,
                          padding: '2px 8px', borderRadius: 20,
                        }}>{news.category}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: '18px 18px 20px' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.45, marginBottom: 10 }}>
                      {news.title}
                    </h3>
                    <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 14 }}>{news.summary}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 12, color: '#aaa', display: 'flex', gap: 10 }}>
                        <span>📅 {formatDate(news.createdAt)}</span>
                        <span>⏱ {news.readTime}</span>
                      </div>
                      <span style={{ fontSize: 13, color: '#e8491d', fontWeight: 600, cursor: 'pointer' }}>Đọc →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewsPage;
