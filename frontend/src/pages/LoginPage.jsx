import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Chặn từ phía client nếu email chứa chữ "admin"
    if (email.toLowerCase().includes("admin")) {
      setError("Tài khoản không hợp lệ");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/login", { email, password });
      // Double-check: chặn nếu role admin hoặc tên chứa "admin"
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
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Đăng nhập</h2>
        {error && <div className="alert-error">{error}</div>}
        {/* Bật lại browser autofill theo yêu cầu */}
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <label className="form-label">Mật khẩu</label>
              <Link to="/forgot-password" className="forgot-link">
                Quên mật khẩu?
              </Link>
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
          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
        <p className="auth-foot">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
