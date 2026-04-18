// OrderDetailPage.jsx — Trang chi tiết đơn hàng

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import ReviewModal from '../components/ReviewModal';

const fmt = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const ORDER_STATUS = {
  CREATED:    { label: 'Chờ xử lý',      color: '#f59e0b', bg: '#fef3c7' },
  CONFIRMED:  { label: 'Đã xác nhận',    color: '#10b981', bg: '#d1fae5' },
  PROCESSING: { label: 'Đang xử lý',    color: '#3b82f6', bg: '#eff6ff' },
  SHIPPED:    { label: 'Đang giao',     color: '#8b5cf6', bg: '#f5f3ff' },
  DELIVERED:  { label: 'Đã giao hàng',   color: '#10b981', bg: '#f0fdf4' },
  CANCELLED:  { label: 'Đã hủy',        color: '#ef4444', bg: '#fee2e2' },
};

const PAYMENT_STATUS = {
  PENDING:    { label: 'Chờ thanh toán', color: '#b45309', bg: '#fffbeb' },
  PAID:       { label: 'Đã thanh toán', color: '#047857', bg: '#ecfdf5' },
  FAILED:     { label: 'Thất bại',      color: '#dc2626', bg: '#fef2f2' },
  REFUNDED:   { label: 'Đã hoàn tiền', color: '#475569', bg: '#f8fafc' },
};

const PAYMENT = {
  cod:           '💵 Thanh toán khi nhận hàng (COD)',
  bank_transfer: '🏦 Chuyển khoản ngân hàng',
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);

  useEffect(() => {
    const fetch = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await axiosInstance.get(`/orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        navigate('/orders', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetch();

    const interval = setInterval(() => {
      fetch(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    setCancelling(true);
    try {
      await axiosInstance.put(`/orders/${id}/cancel`);
      setOrder(o => ({ ...o, orderStatus: 'CANCELLED' }));
      toast.success('Đã hủy đơn hàng');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể hủy đơn');
    } finally { setCancelling(false); }
  };

  if (loading) return <p style={{ textAlign: 'center', padding: 60, color: '#999' }}>Đang tải...</p>;
  if (!order)  return null;

  const orderState = ORDER_STATUS[order.orderStatus] || { label: order.orderStatus, color: '#666', bg: '#f3f4f6' };
  const payState   = PAYMENT_STATUS[order.paymentStatus] || { label: order.paymentStatus, color: '#666', bg: '#f3f4f6' };
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px' }}>

      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: '#999', marginBottom: 20, display: 'flex', gap: 6, alignItems: 'center' }}>
        <Link to="/" style={{ color: '#999' }}>Trang chủ</Link>
        <span>›</span>
        <Link to="/orders" style={{ color: '#999' }}>Đơn hàng</Link>
        <span>›</span>
        <span style={{ color: '#e8491d' }}>#{order._id.slice(-8).toUpperCase()}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>
            Chi tiết đơn hàng
          </h1>
          <p style={{ fontSize: 13, color: '#999' }}>
            Đặt lúc {new Date(order.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            color: payState.color, background: payState.bg, border: `1px solid ${payState.color}20`,
          }}>{payState.label}</span>
          <span style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            color: orderState.color, background: orderState.bg,
          }}>{orderState.label}</span>
        </div>
      </div>

      {/* Sản phẩm */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ececec', marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', fontWeight: 700, fontSize: 14 }}>
          🛍️ Sản phẩm ({order.items.length})
        </div>
        {order.items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
            borderBottom: i < order.items.length - 1 ? '1px solid #f9f9f9' : 'none',
          }}>
            <img
              src={item.image || 'https://placehold.co/64x64'}
              alt={item.name}
              onError={e => { e.target.src = 'https://placehold.co/64x64'; }}
              style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, flexShrink: 0, background: '#f5f5f5' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 3, color: '#1a1a2e' }}>{item.name}</p>
              <p style={{ fontSize: 13, color: '#999' }}>Đơn giá: {fmt(item.price)}</p>
              {(item.color || item.size) && (
                <p style={{ fontSize: 13, color: '#666', marginTop: 3 }}>
                  Phân loại: {[item.color, item.size].filter(Boolean).join(' - ')}
                </p>
              )}
              {order.paymentStatus === 'PAID' && (
                <button
                  onClick={() => setReviewItem(item)}
                  style={{
                    marginTop: 8,
                    padding: '4px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#e8491d',
                    background: '#fff3ed',
                    border: '1px solid #ffccb8',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  ⭐ Đánh giá sản phẩm
                </button>
              )}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 2 }}>×{item.quantity}</p>
              <p style={{ fontWeight: 700, color: '#e8491d', fontSize: 14 }}>{fmt(item.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Thông tin giao hàng */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ececec', padding: '16px 20px' }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>📍 Thông tin giao hàng</p>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{order.shippingAddress}</p>
          <p style={{ fontSize: 13, color: '#555', marginTop: 8 }}>
            {PAYMENT[order.paymentMethod] || order.paymentMethod}
          </p>
        </div>

        {/* Tổng tiền */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ececec', padding: '16px 20px' }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>💰 Tổng thanh toán</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666' }}>
              <span>Tạm tính</span><span>{fmt(subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#10b981' }}>
                <span>Giảm giá {order.couponCode && `(${order.couponCode})`}</span>
                <span>−{fmt(order.discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: '#e8491d', borderTop: '1px solid #f3f4f6', paddingTop: 8, marginTop: 4 }}>
              <span>Tổng cộng</span><span>{fmt(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link to="/orders" style={{
          padding: '10px 22px', border: '1.5px solid #e0e0e0', borderRadius: 24,
          fontSize: 13, fontWeight: 600, color: '#555',
        }}>← Quay lại danh sách</Link>

        {(order.orderStatus === 'CREATED' || order.orderStatus === 'CONFIRMED') && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            style={{
              padding: '10px 22px', border: '1.5px solid #ef4444', borderRadius: 24,
              background: 'transparent', color: '#ef4444', fontSize: 13, fontWeight: 600,
              cursor: cancelling ? 'not-allowed' : 'pointer', opacity: cancelling ? 0.6 : 1,
            }}
          >{cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}</button>
        )}
      </div>

      {/* Review Modal */}
      {reviewItem && (
        <ReviewModal
          productId={reviewItem.productId}
          productName={reviewItem.name}
          onClose={() => setReviewItem(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};

export default OrderDetailPage;
