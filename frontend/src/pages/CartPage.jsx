import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { refreshCartCount } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    axiosInstance.get('/cart')
      .then(res => setCart(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateQty = async (productId, color, size, quantity) => {
    try {
      const res = await axiosInstance.put('/cart/update', { productId, color, size, quantity });
      setCart(res.data.data);
      refreshCartCount();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); }
  };

  const remove = async (productId, color, size) => {
    try {
      const res = await axiosInstance.delete('/cart/remove', { data: { productId, color, size } });
      setCart(res.data.data);
      refreshCartCount();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); }
  };

  if (loading) return <p className="loading">Đang tải giỏ hàng...</p>;

  const items = cart?.items || [];
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (items.length === 0) return (
    <div className="empty-state">
      <p>Giỏ hàng của bạn đang trống</p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
    </div>
  );

  return (
    <div className="cart-wrap">
      <h2 className="page-title">Giỏ hàng <span style={{ fontWeight: 400, fontSize: 16, color: '#6b7280' }}>({items.length} sản phẩm)</span></h2>

      {items.map(item => (
        <div key={`${item.productId}-${item.color}-${item.size}`} className="cart-item">
          <img src={item.image || 'https://placehold.co/80x80'} alt={item.name} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <span className="cart-item-name">{item.name}</span>
            {(item.color || item.size) && (
              <span style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                Phân loại: {[item.color, item.size].filter(Boolean).join(' - ')}
              </span>
            )}
          </div>
          <span className="cart-item-price">{formatPrice(item.price)}</span>
          <div className="qty-ctrl">
            <button onClick={() => updateQty(item.productId, item.color, item.size, item.quantity - 1)}>−</button>
            <span>{item.quantity}</span>
            <button onClick={() => updateQty(item.productId, item.color, item.size, item.quantity + 1)}>+</button>
          </div>
          <span className="cart-item-total">{formatPrice(item.price * item.quantity)}</span>
          <button className="remove-btn" onClick={() => remove(item.productId, item.color, item.size)}>✕</button>
        </div>
      ))}

      <div className="cart-summary">
        <div className="cart-summary-row">
          <span className="cart-total">Tổng cộng:</span>
          <span className="cart-total" style={{ color: '#e94560' }}>{formatPrice(total)}</span>
        </div>
        <p className="cart-note">* Giá chính xác sẽ tính lại theo giá hiện tại khi thanh toán</p>
        <button className="btn btn-accent btn-full btn-lg" style={{ marginTop: 16 }} onClick={() => navigate('/checkout')}>
          Tiến hành thanh toán →
        </button>
      </div>
    </div>
  );
};

export default CartPage;
