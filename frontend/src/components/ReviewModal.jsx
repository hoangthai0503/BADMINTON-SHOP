import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import './ReviewModal.css';

// SVG Star Component (from ProductDetailPage or similar logic)
const StarIcon = ({ filled, onClick }) => (
  <svg
    onClick={onClick}
    width="24" height="24"
    viewBox="0 0 24 24"
    fill={filled ? "#fbbf24" : "none"}
    stroke={filled ? "#fbbf24" : "#cbd5e1"}
    strokeWidth="2"
    style={{ cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s' }}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const Stars = ({ value, onClick }) => {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <StarIcon 
          key={i} 
          filled={i <= value} 
          onClick={onClick ? () => onClick(i) : undefined} 
        />
      ))}
    </div>
  );
};

const ReviewModal = ({ productId, productName, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch if user already reviewed this product
    axiosInstance.get(`/products/${productId}/reviews/me`)
      .then(res => {
        if (res.data.data) {
          setRating(res.data.data.rating);
          setComment(res.data.data.comment);
          setIsEditing(true);
        }
      })
      .catch(() => {});
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post(`/products/${productId}/reviews`, { rating, comment });
      toast.success(isEditing ? 'Cập nhật đánh giá thành công!' : 'Đã gửi đánh giá thành công!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-modal-backdrop" onClick={onClose}>
      <div className="review-modal-card" onClick={e => e.stopPropagation()}>
        <button className="review-modal-close" onClick={onClose}>✕</button>
        <h2 className="review-modal-title">
          {isEditing ? 'Chỉnh sửa đánh giá' : 'Đánh giá sản phẩm'}
        </h2>
        <p className="review-modal-product">{productName}</p>

        <form onSubmit={handleSubmit}>
          <div className="review-rating-pick">
            <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Chất lượng:</span>
            <Stars value={rating} onClick={setRating} />
          </div>
          <textarea
            className="form-input"
            rows={4}
            placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{ marginBottom: 20 }}
          />
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? 'Đang lưu...' : (isEditing ? 'Lưu thay đổi' : 'Gửi đánh giá')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
