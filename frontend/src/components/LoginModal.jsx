import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import "../pages/LoginPage.css";

const LoginModal = () => {
  const { showLoginModal, setShowLoginModal, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Focus lock and escape key
  useEffect(() => {
    if (showLoginModal) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e) => {
        if (e.key === "Escape") setShowLoginModal(false);
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "auto";
        window.removeEventListener("keydown", handleEsc);
      };
    }
  }, [showLoginModal, setShowLoginModal]);

  if (!showLoginModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (email.toLowerCase().includes("admin")) {
      setError("Tài khoản không hợp lệ");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/login", { email, password });
      const u = res.data.data.user;
      if (
        u.role === "admin" ||
        u.name?.toLowerCase().includes("admin") ||
        u.email?.toLowerCase().includes("admin")
      ) {
        setError("Tài khoản không hợp lệ");
        return;
      }
      login(res.data.data.token, res.data.data.user);
      setShowLoginModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)'
    }} onClick={() => setShowLoginModal(false)}>
      <div 
        className="auth-card" 
        style={{ margin: 0, position: 'relative' }} 
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={() => setShowLoginModal(false)}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}
        >✕</button>
        <h2>Đăng nhập</h2>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20, textAlign: 'center' }}>Vui lòng đăng nhập để tiếp tục</p>
        
        {error && <div className="alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label">Mật khẩu</label>
            </div>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
        <p className="auth-foot">
          Chưa có tài khoản? <Link to="/register" onClick={() => setShowLoginModal(false)}>Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
