// AdminLogin.jsx — Trang đăng nhập riêng cho admin
// URL: /admin/login — hoàn toàn tách biệt với form đăng nhập user

import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AdminLogin = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const { login, isLoggedIn, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Nếu đã đăng nhập admin rồi → chuyển thẳng vào dashboard
  if (isLoggedIn && isAdmin) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Gọi endpoint riêng dành cho admin — backend sẽ từ chối nếu không phải admin
      const res = await axiosInstance.post('/auth/admin-login', { email, password });
      const { token, user } = res.data.data;

      login(token, user);
      toast.success('Đăng nhập thành công!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-login-root">
      {/* Cột trái — branding */}
      <div className="adm-login-brand">
        <div className="adm-login-brand-inner">
          <div className="adm-login-logo">🛒</div>
          <h1 className="adm-login-brand-name">E-SHOP</h1>
          <p className="adm-login-brand-sub">Hệ thống quản trị</p>
          <div className="adm-login-features">
            <div className="adm-login-feat">📊 Thống kê doanh thu realtime</div>
            <div className="adm-login-feat">📦 Quản lý sản phẩm & kho hàng</div>
            <div className="adm-login-feat">🧾 Xử lý đơn hàng nhanh chóng</div>
            <div className="adm-login-feat">👥 Quản lý khách hàng</div>
          </div>
        </div>
      </div>

      {/* Cột phải — form */}
      <div className="adm-login-form-wrap">
        <div className="adm-login-card">
          <div className="adm-login-card-header">
            <h2>Đăng nhập Admin</h2>
            <p>Chỉ dành cho tài khoản quản trị viên</p>
          </div>

          <form onSubmit={handleSubmit} className="adm-login-form">
            <div className="form-group">
              <label className="form-label">Email quản trị</label>
              <input
                className="form-input"
                type="email"
                placeholder="admin@shop.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="adm-login-btn"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : '→ Đăng nhập'}
            </button>
          </form>

          <p className="adm-login-back">
            ← <a href="/" style={{ color: '#94a3b8' }}>Về trang cửa hàng</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
