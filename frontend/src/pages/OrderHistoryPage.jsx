import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useToast } from "../context/ToastContext";

const formatPrice = (p) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    p,
  );

const orderStatusText = {
  CREATED: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  CANCELLED: "Đã hủy",
};

const paymentStatusText = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán lỗi",
  REFUNDED: "Đã hoàn tiền",
};

const badgeClass = {
  CREATED: "badge-created",
  CONFIRMED: "badge-confirmed",
  PROCESSING: "badge-processing",
  SHIPPED: "badge-shipped",
  DELIVERED: "badge-delivered",
  CANCELLED: "badge-cancelled",
};

const paymentMethodText = {
  cod: "💵 COD (Tiền mặt)",
  bank_transfer: "🏦 Chuyển khoản",
};

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await axiosInstance.get("/orders/my");
        setOrders(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetch();

    const interval = setInterval(() => {
      fetch(true); // ngầm fetch không load
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) return;
    setCancellingId(orderId);
    try {
      const res = await axiosInstance.put(`/orders/${orderId}/cancel`);
      // Cập nhật status trong danh sách mà không cần gọi lại API
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o))
      );
      toast.success(res.data.message || "Đã hủy đơn hàng");
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể hủy đơn hàng");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <p className="loading">Đang tải...</p>;
  if (orders.length === 0)
    return (
      <div className="empty-state">
        <p>Bạn chưa có đơn hàng nào</p>
      </div>
    );

  return (
    <div className="orders-wrap">
      <h2 className="page-title">
        Lịch sử đơn hàng{" "}
        <span style={{ fontWeight: 400, fontSize: 16, color: "#6b7280" }}>
          ({orders.length})
        </span>
      </h2>

      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <div>
              <p className="order-id">#{order._id.slice(-8).toUpperCase()}</p>
              <p className="order-date">
                {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
              <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
                {paymentMethodText[order.paymentMethod] || "—"}
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span className={`order-badge badge-payment badge-payment-${(order.paymentStatus || (order.status === 'paid' ? 'PAID' : 'PENDING'))?.toLowerCase()}`}>
                  {paymentStatusText[order.paymentStatus] || (order.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán')}
                </span>
                <span className={`order-badge ${badgeClass[order.orderStatus || (order.status === 'paid' ? 'DELIVERED' : order.status === 'cancelled' ? 'CANCELLED' : 'CREATED')] || ""}`}>
                  {orderStatusText[order.orderStatus] || (order.status === 'paid' ? 'Đã giao hàng' : order.status === 'cancelled' ? 'Đã hủy' : 'Chờ xử lý')}
                </span>
              </div>
            </div>
          </div>

          <p className="order-address">📍 {order.shippingAddress}</p>

          {order.items.map((item, i) => (
            <div key={i} className="order-item" style={{ alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>
                  {item.name}{" "}
                  <span style={{ color: "#9ca3af" }}>×{item.quantity}</span>
                </span>
                {(item.color || item.size) && (
                  <span style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                    {[item.color, item.size].filter(Boolean).join(" - ")}
                  </span>
                )}
              </div>
              <span style={{ paddingTop: '2px' }}>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}

          <p className="order-total">Tổng: {formatPrice(order.totalPrice)}</p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
            <Link
              to={`/orders/${order._id}`}
              style={{ fontSize: "13px", color: "#e8491d", fontWeight: 600 }}
            >
              Xem chi tiết →
            </Link>

            {(order.orderStatus === "CREATED" || order.orderStatus === "CONFIRMED") && (
              <button
                onClick={() => handleCancel(order._id)}
                disabled={cancellingId === order._id}
                style={{
                  padding: "6px 16px",
                  background: "transparent",
                  border: "1px solid #ef4444",
                  borderRadius: "6px",
                  color: "#ef4444",
                  cursor: cancellingId === order._id ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  opacity: cancellingId === order._id ? 0.6 : 1,
                }}
              >
                {cancellingId === order._id ? "Đang hủy..." : "Hủy đơn"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistoryPage;
