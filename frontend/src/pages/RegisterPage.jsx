import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.name.toLowerCase().includes('admin') || form.email.toLowerCase().includes('admin')) {
      setError('Tên hoặc email không hợp lệ');
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/register', form);
      login(res.data.data.token, res.data.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Họ tên', name: 'name', type: 'text', placeholder: 'Nguyễn Văn A' },
    { label: 'Email', name: 'email', type: 'email', placeholder: 'email@example.com' },
    { label: 'Mật khẩu', name: 'password', type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Tạo tài khoản</h2>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {fields.map(f => (
            <div key={f.name} className="form-group">
              <label className="form-label">{f.label}</label>
              <input className="form-input" type={f.type} name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} required />
            </div>
          ))}
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>
        <p className="auth-foot">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;
