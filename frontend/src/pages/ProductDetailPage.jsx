import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

// ── Component hiển thị sao ──
const Stars = ({ value, onClick }) => (
  <div className="stars">
    {[1, 2, 3, 4, 5].map(s => (
      <span
        key={s}
        className={`star ${s <= value ? 'on' : ''}`}
        onClick={() => onClick?.(s)}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >★</span>
    ))}
  </div>
);

// ── Component phần đánh giá ──
const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [avg, setAvg]         = useState(0);
  const [total, setTotal]     = useState(0);

  const loadReviews = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/products/${productId}/reviews`);
      setReviews(res.data.data.reviews);
      setAvg(res.data.data.avg);
      setTotal(res.data.data.total);
    } catch { /* ignore */ }
  }, [productId]);

  useEffect(() => { loadReviews(); }, [productId, loadReviews]);

  return (
    <div className="review-section">
      <h3 className="review-title">Đánh giá sản phẩm</h3>

      {/* Tổng quan rating */}
      <div className="review-summary">
        <div className="review-avg-big">{avg || '—'}</div>
        <div>
          <Stars value={Math.round(avg)} />
          <p className="review-count">{total} đánh giá</p>
        </div>
      </div>

      {/* Ghi chú về việc chuyển nơi đánh giá */}
      <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 24, fontSize: 13, color: '#64748b', textAlign: 'center' }}>
        * Chỉ khách hàng đã nhận hàng và thanh toán thành công mới có thể gửi đánh giá từ trang <b>Quản lý Đơn hàng</b>.
      </div>

      {/* Danh sách đánh giá */}
      {reviews.length === 0 ? (
        <p className="review-empty">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
      ) : (
        <div className="review-list">
          {reviews.map(r => (
            <div key={r._id} className="review-item">
              <div className="review-item-header">
                <div className="review-avatar">{r.userName?.[0]?.toUpperCase()}</div>
                <div>
                  <strong className="review-user">{r.userName}</strong>
                  <Stars value={r.rating} />
                </div>
                <span className="review-date">
                  {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                  {r.isEdited && <span style={{ marginLeft: 6, fontStyle: 'italic', fontSize: 11, color: '#9ca3af' }}>(Đã chỉnh sửa)</span>}
                </span>
              </div>
              {r.comment && <p className="review-comment">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Trang chính ──
const ProductDetailPage = () => {
  const { id } = useParams();
  const { isUserLoggedIn, refreshCartCount, setShowLoginModal } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    axiosInstance.get(`/products/${id}`)
      .then(res => setProduct(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isUserLoggedIn) { 
      setShowLoginModal(true); 
      return; 
    }
    if (product.colors?.length > 0 && !selectedColor) {
      toast.error('Vui lòng chọn Màu sắc!');
      return;
    }
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Vui lòng chọn Kích cỡ!');
      return;
    }
    try {
      await axiosInstance.post('/cart/add', { 
        productId: product._id, 
        quantity, 
        color: selectedColor, 
        size: selectedSize 
      });
      refreshCartCount();
      toast.success('Đã thêm vào giỏ hàng!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (loading) return <p className="loading">Đang tải...</p>;
  if (!product) return <div className="empty-state"><p>Không tìm thấy sản phẩm</p></div>;

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="detail-outer">
      {/* Thông tin sản phẩm */}
      <div className="detail-wrap">
        <div style={{ position: 'relative' }}>
          {hasDiscount && (
            <span className="product-card-badge" style={{ top: 12, left: 12, fontSize: 14, padding: '4px 12px' }}>
              -{discountPct}%
            </span>
          )}
          <img
            className="detail-img"
            src={product.image || 'https://placehold.co/420x440?text=No+Image'}
            alt={product.name}
            onError={e => { e.target.src = 'https://placehold.co/420x440?text=No+Image'; }}
          />
        </div>
        <div className="detail-info">
          <p className="detail-cat">{product.category}</p>
          <h1 className="detail-name">{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <p className="detail-price">{formatPrice(product.price)}</p>
            {hasDiscount && (
              <p style={{ fontSize: 16, color: '#9ca3af', textDecoration: 'line-through' }}>
                {formatPrice(product.originalPrice)}
              </p>
            )}
          </div>
          <p className="detail-desc">{product.description || 'Chưa có mô tả.'}</p>

          {/* Biến thể: Màu sắc */}
          {product.colors && product.colors.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <span style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 13, color: '#475569' }}>MÀU SẮC:</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.colors.map(c => (
                  <button 
                    key={c} 
                    onClick={() => setSelectedColor(c)}
                    style={{
                      padding: '6px 14px', borderRadius: 6, border: `1px solid ${selectedColor === c ? '#f97316' : '#cbd5e1'}`,
                      background: selectedColor === c ? '#fff7ed' : '#fff', color: selectedColor === c ? '#ea580c' : '#334155',
                      fontWeight: selectedColor === c ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >{c}</button>
                ))}
              </div>
            </div>
          )}

          {/* Biến thể: Kích cỡ */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <span style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 13, color: '#475569' }}>KÍCH CỠ:</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.sizes.map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSelectedSize(s)}
                    style={{
                      padding: '6px 14px', borderRadius: 6, border: `1px solid ${selectedSize === s ? '#f97316' : '#cbd5e1'}`,
                      background: selectedSize === s ? '#fff7ed' : '#fff', color: selectedSize === s ? '#ea580c' : '#334155',
                      fontWeight: selectedSize === s ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          <p className="detail-stock">Kho còn: <strong>{product.stock} sản phẩm</strong></p>

          <div className="qty-row">
            <span>Số lượng:</span>
            <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
            <span className="qty-value">{quantity}</span>
            <button className="qty-btn" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
          </div>

          <button
            className="btn btn-accent btn-lg"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Hết hàng' : '🛒 Thêm vào giỏ hàng'}
          </button>
        </div>
      </div>

      {/* Phần đánh giá */}
      <ReviewSection productId={id} isLoggedIn={isUserLoggedIn} />
    </div>
  );
};

export default ProductDetailPage;
