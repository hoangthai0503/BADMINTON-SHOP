import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './CheckoutPage.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const CheckoutPage = () => {
  const [cart, setCart]               = useState(null);
  const [address, setAddress]         = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading]         = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [couponCode, setCouponCode]   = useState('');
  const [couponResult, setCouponResult] = useState(null); // { discount, finalTotal, code }
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const navigate = useNavigate();
  const { refreshCartCount } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    axiosInstance.get('/cart').then(res => {
      const data = res.data.data;
      if (!data.items?.length) { navigate('/cart'); return; }
      setCart(data);
    }).catch(console.error).finally(() => setFetchLoading(false));
  }, []);

  const estimated = cart?.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;

  // Áp dụng mã giảm giá
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await axiosInstance.post('/coupons/apply', {
        code: couponCode,
        orderTotal: estimated,
        items: cart.items
      });
      setCouponResult(res.data.data);
      toast.success(`Áp dụng thành công! Giảm ${formatPrice(res.data.data.discount)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mã không hợp lệ');
      setCouponResult(null);
    } finally { setApplyingCoupon(false); }
  };

  const handleRemoveCoupon = () => { setCouponResult(null); setCouponCode(''); };

  const handleOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/orders', {
        shippingAddress: address,
        paymentMethod,
        couponCode: couponResult?.code || null,
      });
      refreshCartCount();
      toast.success('Đặt hàng thành công! Cảm ơn bạn.');
      setTimeout(() => navigate('/orders'), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt hàng thất bại');
    } finally { setLoading(false); }
  };

  if (fetchLoading) return <p className="loading">Đang tải...</p>;

  const finalTotal = couponResult ? couponResult.finalTotal : estimated;

  return (
    <div className="checkout-wrap">
      <h2 className="page-title">Xác nhận đặt hàng</h2>

      {/* Danh sách sản phẩm */}
      <div className="checkout-section">
        <h3>Sản phẩm đặt hàng</h3>
        {cart?.items?.map(item => (
          <div key={`${item.productId}-${item.color}-${item.size}`} className="checkout-item">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span><strong>{item.name}</strong> <span style={{ color: '#9ca3af' }}>x{item.quantity}</span></span>
              {(item.color || item.size) && (
                <span style={{ fontSize: 13, color: '#64748b' }}>
                  Phân loại: {[item.color, item.size].filter(Boolean).join(' - ')}
                </span>
              )}
            </div>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <hr className="checkout-divider" />

        {/* Mã giảm giá */}
        <div className="coupon-row">
          {!couponResult ? (
            <>
              <input
                className="form-input coupon-input"
                placeholder="Nhập mã giảm giá..."
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
              />
              <button
                type="button"
                className="btn btn-outline coupon-btn"
                onClick={handleApplyCoupon}
                disabled={applyingCoupon || !couponCode.trim()}
              >
                {applyingCoupon ? '...' : 'Áp dụng'}
              </button>
            </>
          ) : (
            <div className="coupon-applied">
              <span>🏷️ <strong>{couponResult.code}</strong> — Giảm {formatPrice(couponResult.discount)}</span>
              <button type="button" className="coupon-remove" onClick={handleRemoveCoupon}>✕</button>
            </div>
          )}
        </div>

        {/* Tổng tiền */}
        <div className="checkout-total">
          <span>Tạm tính</span>
          <span>{formatPrice(estimated)}</span>
        </div>
        {couponResult && (
          <div className="checkout-total" style={{ color: '#10b981' }}>
            <span>Giảm giá</span>
            <span>− {formatPrice(couponResult.discount)}</span>
          </div>
        )}
        <div className="checkout-total checkout-total-final">
          <span>Tổng thanh toán</span>
          <span>{formatPrice(finalTotal)}</span>
        </div>
        <p className="checkout-note">* Giá chính xác tính lại theo giá hiện tại khi đặt hàng</p>
      </div>

      {/* Phương thức thanh toán */}
      <div className="checkout-section">
        <h3>Phương thức thanh toán</h3>
        <div className="payment-methods">
          <label className="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={e => setPaymentMethod(e.target.value)}
            />
            <div className="payment-label">
              <span className="payment-icon">💵</span>
              <div>
                <p className="payment-title">Thanh toán khi nhận hàng (COD)</p>
                <p className="payment-desc">Bạn sẽ thanh toán tiền mặt khi nhân viên giao hàng đến</p>
              </div>
            </div>
          </label>

          <label className="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="bank_transfer"
              checked={paymentMethod === 'bank_transfer'}
              onChange={e => setPaymentMethod(e.target.value)}
            />
            <div className="payment-label">
              <span className="payment-icon">🏦</span>
              <div>
                <p className="payment-title">Chuyển khoản qua ngân hàng</p>
                <p className="payment-desc">Chuyển khoản trước, chúng tôi sẽ xác nhận và giao hàng</p>
              </div>
            </div>
          </label>
        </div>

        {/* Thông tin chuyển khoản nếu chọn bank transfer */}
        {paymentMethod === 'bank_transfer' && (
          <div className="bank-info">
            <p className="bank-info-title">💬 Thông tin chuyển khoản:</p>
            <div className="bank-details">
              <p><strong>Chủ tài khoản:</strong> CÔNG TY TNHH E-SHOP</p>
              <p><strong>Số tài khoản:</strong> 1234567890 (Vietcombank)</p>
              <p><strong>Nội dung:</strong> [YourOrderID] - {address.substring(0, 20)}...</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                Sau khi chuyển khoản, vui lòng liên hệ 0123-456-789 để xác nhận
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Địa chỉ giao hàng */}
      <form onSubmit={handleOrder}>
        <div className="checkout-section">
          <h3>Địa chỉ giao hàng</h3>
          <textarea
            className="form-input"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
            required
          />
        </div>
        <button type="submit" className="btn btn-accent btn-full btn-lg" disabled={loading}>
          {loading ? 'Đang xử lý...' : '✓ Xác nhận đặt hàng'}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
