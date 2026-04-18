// AdminLayout.jsx — Layout riêng cho toàn bộ trang admin
// Sidebar trái + content area phải, hoàn toàn tách biệt giao diện người dùng

import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";

const MENU = [
  { to: "/admin", icon: "📊", label: "Tổng quan" },
  { to: "/admin/products", icon: "📦", label: "Sản phẩm" },
  { to: "/admin/categories", icon: "🗂️", label: "Danh mục" },
  { to: "/admin/orders", icon: "🧾", label: "Đơn hàng" },
  { to: "/admin/news", icon: "📰", label: "Tin tức" },
  { to: "/admin/banners", icon: "🖼️", label: "Banners" },
  { to: "/admin/users", icon: "👥", label: "Tài khoản user" },
  { to: "/admin/coupons", icon: "🎟️", label: "Voucher" },
];

const AdminLayout = ({ children, pageTitle = "Bảng điều khiển" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch số đơn hàng mới (CREATED) để hiện thông báo
  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/orders/all?orderStatus=CREATED&limit=0');
      const total = res.data.data.total || 0;
      setPendingCount(total);
    } catch (err) {
      console.error('Lỗi lấy số đơn chờ:', err);
    }
  }, []);

  useEffect(() => {
    fetchPendingCount();
    const timer = setInterval(fetchPendingCount, 20000); 
    return () => clearInterval(timer);
  }, [fetchPendingCount]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="adm-root">
      {/* ── Sidebar ── */}
      <aside className={`adm-sidebar ${sidebarHidden ? 'hidden' : ''}`}>
        {/* Logo */}
        <div className="adm-logo">
          <span className="adm-logo-icon">🛒</span>
          <div>
            <p className="adm-logo-title">E-SHOP</p>
            <p className="adm-logo-sub">Admin Panel</p>
          </div>
        </div>

        {/* Nav menu */}
        <nav className="adm-nav">
          <p className="adm-nav-section">QUẢN LÝ</p>
          {MENU.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.to === "/admin"}
              className={({ isActive }) =>
                `adm-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="adm-nav-icon">{m.icon}</span>
              <span style={{ flex: 1 }}>{m.label}</span>
              {m.label === "Đơn hàng" && pendingCount > 0 && (
                <span className="adm-side-badge">{pendingCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="adm-sidebar-footer">
          <div className="adm-user-info">
            <div className="adm-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <p className="adm-user-name">{user?.name}</p>
              <p className="adm-user-role">Administrator</p>
            </div>
          </div>
          <button className="adm-logout-btn" onClick={handleLogout}>
            ⏻ Đăng xuất
          </button>
          <button className="adm-back-btn" onClick={() => navigate("/")}>
            ← Về trang chủ
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="adm-main">
        {/* Top bar */}
        <header className="adm-topbar">
          <div className="adm-topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => setSidebarHidden(!sidebarHidden)} 
              title="Ẩn/hiện thanh điều hướng"
              style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#1e293b', paddingTop: '4px' }}
            >
              ☰
            </button>
            <h1 className="adm-page-title">{pageTitle}</h1>
          </div>
          <div className="adm-topbar-right">
            <span className="adm-time">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="adm-content">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
