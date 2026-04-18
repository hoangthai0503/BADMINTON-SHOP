import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useToast } from "../context/ToastContext";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  useEffect(() => {
    // Kiểm tra xem token có hợp lệ không
    if (!token) {
      setError("Token không hợp lệ");
      return;
    }
    setTokenValid(true);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp");
      return;
    }

    if (password.length < 6) {
      toast.error("Mật khẩu phải ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/reset-password", {
        token,
        newPassword: password,
      });
      toast.success("Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Đặt lại mật khẩu thất bại");
      setError(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>❌ Lỗi</h2>
          <p
            style={{
              color: "#dc2626",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            {error}
          </p>
          <a
            href="/login"
            className="btn btn-primary btn-full btn-lg"
            style={{
              textAlign: "center",
              textDecoration: "none",
              display: "block",
            }}
          >
            Quay lại đăng nhập
          </a>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>⏳ Đang xác nhận...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Đặt lại mật khẩu</h2>
        <p
          style={{
            color: "#9ca3af",
            marginBottom: "20px",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          Nhập mật khẩu mới của bạn
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Mật khẩu mới</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Xác nhận mật khẩu</label>
            <input
              className="form-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
