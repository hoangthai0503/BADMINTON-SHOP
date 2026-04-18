import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const MARQUEE = [
  '🔥 Flash Sale 12h – 14h mỗi ngày',
  '🚚 Miễn phí vận chuyển đơn từ 500.000đ',
  '💳 Thanh toán online giảm thêm 5%',
  '🎁 Quà tặng cho đơn trên 1 triệu',
  '⭐ Đổi trả miễn phí 30 ngày',
  '📦 Giao hàng nhanh 2h nội thành',
];

const Banner = () => {
  const [slides, setSlides] = useState([]);
  const [cur, setCur] = useState(0);

  useEffect(() => {
    axiosInstance.get('/banners').then(res => {
      if (res.data?.data) {
        setSlides(res.data.data);
      }
    }).catch(() => console.error("Could not load banners"));
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCur(c => (c + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  const s = slides[cur];

  return (
    <div className="banner-wrap">
      {/* Slide */}
      {slides.length > 0 && (
      <div className="banner-slide" style={{ background: s?.bg }}>
        {/* Text content */}
        <div className="banner-text">
          <span className="banner-tag">{s?.tag}</span>
          <h2 className="banner-title">
            {s?.title?.split('\\n').map((line, i) => <span key={i}>{line}<br/></span>)}
          </h2>
          <p className="banner-sub">{s?.sub}</p>
          <Link to={s?.ctaLink || '/products'} className="banner-cta" style={{ background: s?.ctaColor, display: 'inline-block' }}>
            {s?.cta} →
          </Link>
        </div>

        {/* Ảnh minh họa */}
        <div className="banner-img-wrap">
          <img src={s.image || s.img} alt="banner" className="banner-img" />
        </div>

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <button className="bnr-arrow left" onClick={() => setCur(c => (c - 1 + slides.length) % slides.length)}>❮</button>
            <button className="bnr-arrow right" onClick={() => setCur(c => (c + 1) % slides.length)}>❯</button>
          </>
        )}

        {/* Dots */}
        {slides.length > 1 && (
        <div className="bnr-dots">
          {slides.map((_, i) => (
            <span key={i} className={`bnr-dot ${i === cur ? 'on' : ''}`} onClick={() => setCur(i)} />
          ))}
        </div>
        )}
      </div>
      )}

      {/* Marquee */}
      <div className="bnr-marquee">
        <div className="bnr-marquee-track">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} className="bnr-marquee-item">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner;
