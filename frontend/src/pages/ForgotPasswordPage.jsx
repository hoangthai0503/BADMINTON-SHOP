import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useToast } from "../context/ToastContext";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      toast.success(res.data.message);
      setSent(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gửi email thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>✓ Email sent</h2>
          <p
            className="form-label"
            style={{ textAlign: "center", marginBottom: "20px" }}
          >
            Chúng tôi đã gửi link reset password đến <strong>{email}</strong>
          </p>
          <p
            style={{
              textAlign: "center",
              color: "#9ca3af",
              marginBottom: "20px",
            }}
          >
            Kiểm tra email và nhấn link để đặt lại mật khẩu. Link hết hạn sau 1
            giờ.
          </p>
          <Link
            to="/login"
            className="btn btn-primary btn-full btn-lg"
            style={{
              textAlign: "center",
              textDecoration: "none",
              display: "block",
            }}
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Quên mật khẩu?</h2>
        <p
          style={{
            color: "#9ca3af",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          Nhập email của bạn, chúng tôi sẽ gửi link để đặt lại mật khẩu
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Gửi link reset"}
          </button>
        </form>
        <p className="auth-foot">
          <Link to="/login">← Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
