import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Banner from '../components/Banner';
import ProductCard from '../components/ProductCard';
import '../home.css';

const HomePage = () => {
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Parallel
        const [disRes, bestRes, catRes, newsRes] = await Promise.all([
          axiosInstance.get('/products?tab=discount&limit=4'),
          axiosInstance.get('/products?tab=bestseller&limit=4'),
          axiosInstance.get('/categories'),
          axiosInstance.get('/news?limit=3')
        ]);
        
        setDiscountedProducts(disRes.data.data?.products || []);
        setBestsellers(bestRes.data.data?.products || []);
        setCategories(catRes.data.data || []);
        setNews(newsRes.data.data || []);
      } catch (err) {
        console.error("Home page data fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: '100px 0', textAlign: 'center' }}>Đang tải trang chủ...</div>;

  return (
    <div className="home-page">
      {/* 1. Hero Banner Component */}
      <Banner />

      {/* 2. Khối Dịch vụ Uy Tín */}
      <section className="home-services">
        <div className="container">
          <div className="services-grid">
            <div className="service-item">
              <span className="service-icon">🚚</span>
              <div>
                <h4>Miễn phí vận chuyển</h4>
                <p>Mọi đơn hàng từ 500k</p>
              </div>
            </div>
            <div className="service-item">
              <span className="service-icon">⭐</span>
              <div>
                <h4>Đổi trả 30 ngày</h4>
                <p>Nhanh chóng, miễn phí</p>
              </div>
            </div>
            <div className="service-item">
              <span className="service-icon">💳</span>
              <div>
                <h4>Thanh toán an toàn</h4>
                <p>100% bảo mật thông tin</p>
              </div>
            </div>
            <div className="service-item">
              <span className="service-icon">🎧</span>
              <div>
                <h4>Hỗ trợ 24/7</h4>
                <p>Hotline: 1900 1234</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Phân loại Danh Mục (Categories) */}
      <section className="home-section bg-gray">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Danh Mục Nổi Bật</h2>
            <Link to="/products" className="view-all">Xem tất cả →</Link>
          </div>
          
          <div className="home-cat-grid">
            {categories.slice(0, 6).map(cat => (
              <Link key={cat._id} to={`/products?category=${cat._id}`} className="home-cat-card">
                <div className="cat-icon">{cat.icon || '📦'}</div>
                <div className="cat-name">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Giờ Vàng Giá Sốc (Flash Sale) */}
      {discountedProducts.length > 0 && (
        <section className="home-section">
          <div className="container">
            <div className="section-head flash-sale-head">
              <h2 className="section-title">🔥 Giờ Vàng Giá Sốc</h2>
              <Link to="/products?tab=discount" className="view-all">Xem thêm Mẫu Sale →</Link>
            </div>
            <div className="product-grid">
              {discountedProducts.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Sản Phẩm Bán Chạy */}
      {bestsellers.length > 0 && (
        <section className="home-section">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">💎 Sản Phẩm Bán Chạy</h2>
              <Link to="/products?tab=bestseller" className="view-all">Xem tất cả top bán chạy →</Link>
            </div>
            <div className="product-grid">
              {bestsellers.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Góc Tin Tức */}
      {news.length > 0 && (
        <section className="home-section bg-gray">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">📰 GÓC TIN TỨC</h2>
              <Link to="/news" className="view-all">Xem tất cả bài viết →</Link>
            </div>
            <div className="home-news-grid">
              {news.map(item => (
                <Link key={item._id} to={`/news/${item._id}`} className="home-news-card">
                  <div className="news-img-cap">
                    <img src={item.image || 'https://placehold.co/400x250?text=News'} alt={item.title} />
                  </div>
                  <div className="news-content">
                    <span className="news-date">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                    <h3 className="news-title">{item.title}</h3>
                    <p className="news-ex">{item.content ? item.content.substring(0, 100) + '...' : ''}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
