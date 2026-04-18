// AdminOrders.jsx — Trang quản lý tất cả đơn hàng (admin)
// Hiển thị toàn bộ orders của mọi user, cho phép cập nhật trạng thái

import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import AdminLayout from "./AdminLayout";
import { useToast } from "../../context/ToastContext";

const formatPrice = (p) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    p,
  );

const orderStatusText = {
  CREATED: "🆕 Mới",
  CONFIRMED: "✅ Đã xác nhận",
  PROCESSING: "⚙️ Đang xử lý",
  SHIPPED: "🚚 Đang giao",
  DELIVERED: "🏁 Đã giao",
  CANCELLED: "❌ Đã hủy",
};

const paymentStatusText = {
  PENDING: "🕒 Chờ thanh toán",
  PAID: "💰 Đã thanh toán",
  FAILED: "⚠️ Thất bại",
  REFUNDED: "🔙 Đã hoàn tiền",
};

const LIMIT = 10;

const AdminOrders = () => {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState(null);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const [filterOrder, setFilterOrder] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [search, setSearch]       = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [page, filterOrder, filterPayment, search]);

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filterOrder) params.orderStatus = filterOrder;
      if (filterPayment) params.paymentStatus = filterPayment;
      if (search) params.search = search;
      const res = await axiosInstance.get("/orders/all", { params });
      const d = res.data.data;
      setOrders(d.orders || []);
      setTotalPages(d.totalPages || 1);
      setTotal(d.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật trạng thái
  const updateStatus = async (orderId, updates) => {
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, updates);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, ...updates } : o)),
      );
      toast.success("Đã cập nhật đơn hàng");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const toggleExpand = (id) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <AdminLayout pageTitle="Quản lý đơn hàng">
      <div className="adm-section-card">
        <div className="adm-top-bar" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <h2>
            Tất cả đơn hàng{" "}
            <span style={{ fontWeight: 400, fontSize: 13, color: "#94a3b8" }}>
              ({total})
            </span>
          </h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              className="form-input"
              style={{ width: 180, margin: 0 }}
              placeholder="🔍 Mã đơn, email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            <select
              className="form-input"
              style={{ width: 140, margin: 0 }}
              value={filterOrder}
              onChange={e => { setFilterOrder(e.target.value); setPage(1); }}
            >
              <option value="">Đơn hàng (Tất cả)</option>
              {Object.entries(orderStatusText).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              className="form-input"
              style={{ width: 150, margin: 0 }}
              value={filterPayment}
              onChange={e => { setFilterPayment(e.target.value); setPage(1); }}
            >
              <option value="">Thanh toán (Tất cả)</option>
              {Object.entries(paymentStatusText).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ padding: "32px", color: "#999", textAlign: "center" }}>
            Đang tải...
          </p>
        ) : orders.length === 0 ? (
          <p style={{ padding: "32px", color: "#999", textAlign: "center" }}>
            Chưa có đơn hàng nào
          </p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Địa chỉ</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thanh toán</th>
                <th>Hành động</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <React.Fragment key={o._id}>
                  <tr>
                    <td>
                      <code className="adm-code" style={{ fontSize: 11 }}>
                        #{o._id.slice(-8).toUpperCase()}
                      </code>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                        {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {o.userId?.name || "—"}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        {o.userId?.email || ""}
                      </div>
                    </td>
                    <td
                      title={o.shippingAddress}
                      style={{
                        maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis",
                        whiteSpace: "nowrap", fontSize: 12.5
                      }}
                    >
                      {o.shippingAddress}
                    </td>
                    <td style={{ fontWeight: 700, color: "#e8491d", fontSize: 13 }}>
                      {formatPrice(o.totalPrice)}
                    </td>
                    <td>
                      <span className={`adm-badge adm-badge-${(o.orderStatus || o.status)?.toLowerCase()}`}>
                        {orderStatusText[o.orderStatus] || (o.status === 'paid' ? '🏁 Hoàn tất' : o.status === 'cancelled' ? '❌ Đã hủy' : '🆕 Mới')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-payment badge-payment-${(o.paymentStatus || (o.status === 'paid' ? 'PAID' : 'PENDING'))?.toLowerCase()}`}>
                        {paymentStatusText[o.paymentStatus] || (o.status === 'paid' ? '💰 Đã thanh toán' : '🕒 Chờ thanh toán')}
                      </span>
                    </td>
                    <td>
                      <div className="adm-action-btns">
                        {/* Quy trình đơn hàng */}
                        {o.orderStatus === 'CREATED' && (
                          <>
                            <button className="btn-action btn-action-success" onClick={() => updateStatus(o._id, { orderStatus: 'CONFIRMED' })}>Xác nhận</button>
                            <button className="btn-action btn-action-danger" onClick={() => { if(window.confirm('Hủy đơn hàng?')) updateStatus(o._id, { orderStatus: 'CANCELLED' }) }}>Hủy</button>
                          </>
                        )}
                        {o.orderStatus === 'CONFIRMED' && (
                          <>
                            <button className="btn-action btn-action-primary" onClick={() => updateStatus(o._id, { orderStatus: 'PROCESSING' })}>Xử lý</button>
                            <button className="btn-action btn-action-danger" onClick={() => { if(window.confirm('Hủy đơn hàng?')) updateStatus(o._id, { orderStatus: 'CANCELLED' }) }}>Hủy</button>
                          </>
                        )}
                        {o.orderStatus === 'PROCESSING' && (
                          <>
                            <button className="btn-action btn-action-primary" onClick={() => updateStatus(o._id, { orderStatus: 'SHIPPED' })}>🚚 Giao hàng</button>
                            <button className="btn-action btn-action-danger" onClick={() => { if(window.confirm('Hủy đơn hàng đang xử lý?')) updateStatus(o._id, { orderStatus: 'CANCELLED' }) }}>Hủy</button>
                          </>
                        )}
                        {o.orderStatus === 'SHIPPED' && (
                          <button className="btn-action btn-action-success" onClick={() => updateStatus(o._id, { orderStatus: 'DELIVERED', paymentStatus: 'PAID' })}>🏁 Hoàn tất</button>
                        )}

                        {/* Thanh toán độc lập (nếu cần) */}
                        {o.paymentStatus !== 'PAID' && o.orderStatus !== 'CANCELLED' && (
                          <button 
                            className="btn-action btn-action-outline" 
                            onClick={() => { if(window.confirm('Xác nhận bạn ĐÃ NHẬN TIỀN cho đơn hàng này?')) updateStatus(o._id, { paymentStatus: 'PAID' }) }}
                          >
                            💵 Đã nhận tiền
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <button className="adm-link-btn" onClick={() => toggleExpand(o._id)}>
                        {expanded === o._id ? "▲" : "▼"}
                      </button>
                    </td>
                  </tr>

                  {/* Hàng mở rộng: danh sách sản phẩm trong đơn */}
                  {expanded === o._id && (
                    <tr key={`${o._id}-detail`}>
                      <td
                        colSpan={8}
                        style={{ background: "#f8fafc", padding: "14px 20px" }}
                      >
                        <table
                          style={{ width: "100%", borderCollapse: "collapse" }}
                        >
                          <thead>
                            <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                              <th
                                style={{
                                  padding: "6px 10px",
                                  textAlign: "left",
                                  fontSize: 12,
                                  color: "#64748b",
                                  fontWeight: 700,
                                }}
                              >
                                Sản phẩm
                              </th>
                              <th
                                style={{
                                  padding: "6px 10px",
                                  textAlign: "right",
                                  fontSize: 12,
                                  color: "#64748b",
                                  fontWeight: 700,
                                }}
                              >
                                Đơn giá
                              </th>
                              <th
                                style={{
                                  padding: "6px 10px",
                                  textAlign: "right",
                                  fontSize: 12,
                                  color: "#64748b",
                                  fontWeight: 700,
                                }}
                              >
                                SL
                              </th>
                              <th
                                style={{
                                  padding: "6px 10px",
                                  textAlign: "right",
                                  fontSize: 12,
                                  color: "#64748b",
                                  fontWeight: 700,
                                }}
                              >
                                Thành tiền
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {o.items.map((item, idx) => (
                              <tr
                                key={idx}
                                style={{ borderBottom: "1px solid #f1f5f9" }}
                              >
                                <td
                                  style={{
                                    padding: "8px 10px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                  }}
                                >
                                  <img
                                    src={
                                      item.image || "https://placehold.co/40x40"
                                    }
                                    alt=""
                                    style={{
                                      width: 36,
                                      height: 36,
                                      objectFit: "cover",
                                      borderRadius: 4,
                                    }}
                                  />
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: 13 }}>
                                      {item.name}
                                    </span>
                                    {(item.color || item.size) && (
                                      <span style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                                        {[item.color, item.size].filter(Boolean).join(' - ')}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td
                                  style={{
                                    padding: "8px 10px",
                                    textAlign: "right",
                                    fontSize: 13,
                                  }}
                                >
                                  {formatPrice(item.price)}
                                </td>
                                <td
                                  style={{
                                    padding: "8px 10px",
                                    textAlign: "right",
                                    fontSize: 13,
                                  }}
                                >
                                  x{item.quantity}
                                </td>
                                <td
                                  style={{
                                    padding: "8px 10px",
                                    textAlign: "right",
                                    fontSize: 13,
                                    fontWeight: 700,
                                  }}
                                >
                                  {formatPrice(item.price * item.quantity)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="pagination" style={{ padding: '16px 0 4px' }}>
            <button className="btn-page" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Trước</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`btn-page ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="btn-page" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Sau →</button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
