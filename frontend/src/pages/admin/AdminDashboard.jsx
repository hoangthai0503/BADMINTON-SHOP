// AdminDashboard.jsx — Trang tổng quan admin với biểu đồ

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import AdminLayout from './AdminLayout';

const fmt = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

// ── Biểu đồ cột doanh thu 7 ngày (SVG thuần) ──────────────────────────────
const RevenueChart = ({ orders }) => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const data = days.map(d => {
    const label = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const total = orders
      .filter(o => {
        const od = new Date(o.createdAt);
        return od.toDateString() === d.toDateString() && o.paymentStatus === 'PAID';
      })
      .reduce((s, o) => s + o.totalPrice, 0);
    return { label, total };
  });

  const maxVal = Math.max(...data.map(d => d.total), 1);
  const W = 560, H = 160, PAD = 40, BAR_W = 44, GAP = (W - PAD * 2 - BAR_W * 7) / 6;

  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} style={{ width: '100%', overflow: 'visible' }}>
      {[0, 0.25, 0.5, 0.75, 1].map(r => (
        <line key={r} x1={PAD} x2={W - PAD} y1={H - H * r} y2={H - H * r}
          stroke="#f0f0f0" strokeWidth="1" />
      ))}

      {data.map((d, i) => {
        const x = PAD + i * (BAR_W + GAP);
        const barH = maxVal > 0 ? (d.total / maxVal) * (H - 10) : 0;
        const y = H - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={BAR_W} height={barH}
              rx="4" fill={barH > 0 ? '#10b981' : '#f0f0f0'} opacity={barH > 0 ? 0.85 : 1} />
            {barH > 14 && (
              <text x={x + BAR_W / 2} y={y - 4} textAnchor="middle"
                fontSize="9" fill="#059669" fontWeight="700">
                {d.total >= 1000000
                  ? `${(d.total / 1000000).toFixed(1)}M`
                  : d.total >= 1000 ? `${Math.round(d.total / 1000)}k` : d.total}
              </text>
            )}
            <text x={x + BAR_W / 2} y={H + 18} textAnchor="middle"
              fontSize="10" fill="#94a3b8">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const DonutChart = ({ stats }) => {
  const total = Object.values(stats).reduce((a, b) => a + b, 0) || 1;
  const data = [
    { label: 'Mới',       value: stats.CREATED || 0,    color: '#f59e0b' },
    { label: 'Xử lý',     value: (stats.CONFIRMED || 0) + (stats.PROCESSING || 0), color: '#3b82f6' },
    { label: 'Giao hàng', value: stats.SHIPPED || 0,    color: '#8b5cf6' },
    { label: 'Hoàn tất',  value: stats.DELIVERED || 0,  color: '#10b981' },
    { label: 'Đã hủy',    value: stats.CANCELLED || 0,  color: '#ef4444' },
  ];

  let cumAngle = -Math.PI / 2;
  const R = 60, cx = 80, cy = 80, rInner = 36;

  const slices = data.map(d => {
    const angle = (d.value / total) * Math.PI * 2;
    const x1 = cx + R * Math.cos(cumAngle);
    const y1 = cy + R * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + R * Math.cos(cumAngle);
    const y2 = cy + R * Math.sin(cumAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const xi1 = cx + rInner * Math.cos(cumAngle - angle);
    const yi1 = cy + rInner * Math.sin(cumAngle - angle);
    const xi2 = cx + rInner * Math.cos(cumAngle);
    const yi2 = cy + rInner * Math.sin(cumAngle);
    return { ...d, path: `M${x1},${y1} A${R},${R} 0 ${largeArc},1 ${x2},${y2} L${xi2},${yi2} A${rInner},${rInner} 0 ${largeArc},0 ${xi1},${yi1} Z` };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg viewBox="0 0 160 160" style={{ width: 140, flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} opacity={0.9} />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#1a1a2e">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#94a3b8">đơn hàng</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {data.map(d => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#64748b' }}>{d.label}</span>
            <strong style={{ marginLeft: 'auto', fontSize: 13, color: '#1e293b' }}>{d.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [orders, setOrders]     = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const [prodRes, orderRes] = await Promise.all([
          axiosInstance.get('/products?limit=100'),
          axiosInstance.get('/orders/all'),
        ]);
        setProducts(prodRes.data.data.products);
        const oData = orderRes.data.data;
        setOrders(oData.orders || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
    const interval = setInterval(() => fetch(true), 5000);
    return () => clearInterval(interval);
  }, []);

  // Tính toán thống kê chi tiết
  const stats = orders.reduce((acc, o) => {
    acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
    return acc;
  }, {});

  const totalRevenue = orders
    .filter(o => (o.paymentStatus === 'PAID' || o.status === 'paid'))
    .reduce((s, o) => s + o.totalPrice, 0);

  const paidCount = orders.filter(o => (o.paymentStatus === 'PAID' || o.status === 'paid')).length;
  const cancelledCount = (stats.CANCELLED || 0) + (orders.filter(o => !o.orderStatus && o.status === 'cancelled').length);
  const newOrdersCount = (stats.CREATED || 0) + (orders.filter(o => !o.orderStatus && o.status === 'pending').length);

  // Top 5 sản phẩm bán chạy (dựa trên đơn không hủy)
  const salesMap = {};
  orders.filter(o => o.orderStatus !== 'CANCELLED').forEach(o =>
    o.items?.forEach(item => {
      salesMap[item.name] = (salesMap[item.name] || 0) + item.quantity;
    })
  );
  const topProducts = Object.entries(salesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const STAT_CARDS = [
    { label: 'Đơn hàng mới',   value: newOrdersCount,         icon: '🆕', color: '#f59e0b', bg: '#fffbeb', sub: 'Cần xác nhận ngay' },
    { label: 'Doanh thu',       value: fmt(totalRevenue),      icon: '💰', color: '#10b981', bg: '#ecfdf5', sub: `${paidCount} đơn đã thanh toán` },
    { label: 'Sản phẩm',        value: products.length,       icon: '📦', color: '#3b82f6', bg: '#eff6ff', sub: `${products.filter(p => p.stock === 0).length} hết hàng` },
    { label: 'Tỷ lệ hủy',      value: orders.length ? ((cancelledCount/orders.length)*100).toFixed(1) + '%' : '0%', icon: '✕', color: '#ef4444', bg: '#fff1f2', sub: `${cancelledCount} đơn đã hủy` },
  ];

  const orderStatusMap = {
    CREATED: { text: 'Mới', class: 'adm-badge-created' },
    CONFIRMED: { text: 'Xác nhận', class: 'adm-badge-confirmed' },
    PROCESSING: { text: 'Xử lý', class: 'adm-badge-processing' },
    SHIPPED: { text: 'Đang giao', class: 'adm-badge-shipped' },
    DELIVERED: { text: 'Hoàn tất', class: 'adm-badge-delivered' },
    CANCELLED: { text: 'Đã hủy', class: 'adm-badge-cancelled' },
  };

  return (
    <AdminLayout pageTitle="Tổng quan">
      <div className="adm-stats-grid">
        {STAT_CARDS.map(c => (
          <div key={c.label} className="adm-stat-card" style={{ borderTop: `3px solid ${c.color}` }}>
            <div className="adm-stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
            <div>
              <p className="adm-stat-value">{loading ? '—' : c.value}</p>
              <p className="adm-stat-label">{c.label}</p>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-charts-row">
        <div className="adm-section-card" style={{ flex: 2 }}>
          <div className="adm-section-header">
            <h3 className="adm-section-title">Doanh thu 7 ngày (Đã thanh toán)</h3>
          </div>
          <div style={{ padding: '16px 20px 8px' }}>
            {loading ? <p style={{ color: '#ccc', textAlign: 'center', padding: 32 }}>Đang tải...</p> : <RevenueChart orders={orders} />}
          </div>
        </div>

        <div className="adm-section-card" style={{ flex: 1 }}>
          <div className="adm-section-header">
            <h3 className="adm-section-title">Phân bổ trạng thái</h3>
          </div>
          <div style={{ padding: '20px' }}>
            {loading ? <p style={{ color: '#ccc', textAlign: 'center', padding: 32 }}>Đang tải...</p> : <DonutChart stats={stats} />}
          </div>
        </div>
      </div>

      <div className="adm-charts-row">
        <div className="adm-section-card" style={{ flex: 1 }}>
          <div className="adm-section-header"><h3 className="adm-section-title">Top sản phẩm</h3></div>
          <div style={{ padding: '8px 0' }}>
            {loading ? <p style={{ color: '#ccc', textAlign: 'center', padding: 32 }}>Đang tải...</p>
            : topProducts.length === 0 ? <p style={{ color: '#ccc', textAlign: 'center', padding: 24, fontSize: 13 }}>Chưa có dữ liệu</p>
            : topProducts.map(([name, qty], i) => (
                <div key={name} style={{ padding: '10px 20px', borderBottom: i < topProducts.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>#{i+1} {name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#e8491d' }}>{qty} bán</span>
                  </div>
                  <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${Math.round((qty/topProducts[0][1])*100)}%`, background: '#e8491d', borderRadius: 3, opacity: 0.8 }} />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="adm-section-card" style={{ flex: 2 }}>
          <div className="adm-section-header">
            <h3 className="adm-section-title">Đơn hàng mới</h3>
            <button className="adm-link-btn" onClick={() => navigate('/admin/orders')}>Xem tất cả →</button>
          </div>
          {loading ? <p style={{ padding: '24px', color: '#999', textAlign: 'center' }}>Đang tải...</p>
          : orders.length === 0 ? <p style={{ padding: '24px', color: '#999', textAlign: 'center' }}>Trống</p>
          : (
            <table className="adm-table">
              <thead><tr><th>Mã đơn</th><th>Khách</th><th>Tổng tiền</th><th>Ngày</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {orders.slice(0, 6).map(o => (
                  <tr key={o._id}>
                    <td><code className="adm-code">#{o._id.slice(-6).toUpperCase()}</code></td>
                    <td style={{ fontSize: 13 }}>{o.userId?.name || '—'}</td>
                    <td style={{ fontWeight: 700, color: '#e8491d' }}>{fmt(o.totalPrice)}</td>
                    <td style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <span className={`adm-badge ${orderStatusMap[o.orderStatus]?.class}`}>
                        {orderStatusMap[o.orderStatus]?.text}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
