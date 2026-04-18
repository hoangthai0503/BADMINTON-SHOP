// ProfilePage.jsx — Trang cá nhân: đổi tên và đổi mật khẩu

import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProfilePage = () => {
  const { user, login, token } = useAuth();
  const { toast } = useToast();

  const getNameParts = (fullName) => {
    if (!fullName) return { first: '', last: '' };
    const parts = fullName.trim().split(' ');
    const first = parts.pop();
    const last = parts.join(' ');
    return { first, last: last || '' };
  };

  const initialName = getNameParts(user?.name);
  const [lastName, setLastName]   = useState(initialName.last);
  const [firstName, setFirstName] = useState(initialName.first);
  const [phone, setPhone]         = useState(user?.phone || '');
  const [gender, setGender]       = useState(user?.gender || 'khac');
  // dob from backend is full date string, we need YYYY-MM-DD for date input
  const [dob, setDob]             = useState(user?.dob ? new Date(user?.dob).toISOString().split('T')[0] : '');
  const [oldPass, setOldPass]     = useState('');
  const [newPass, setNewPass]     = useState('');
  const [confirmPass, setConfirm] = useState('');
  const [loading, setLoading]     = useState(false);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) return;
    const fullName = lastName.trim() ? `${lastName.trim()} ${firstName.trim()}` : firstName.trim();
    
    setLoading(true);
    try {
      const res = await axiosInstance.put('/auth/profile', { name: fullName, phone, gender, dob: dob || null });
      // Cập nhật lại context với dữ liệu mới (giữ nguyên token)
      login(token, { ...user, ...res.data.data });
      toast.success('Đã cập nhật thông tin thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) { toast.error('Mật khẩu xác nhận không khớp'); return; }
    if (newPass.length < 6) { toast.error('Mật khẩu mới ít nhất 6 ký tự'); return; }
    setLoading(true);
    try {
      await axiosInstance.put('/auth/profile', { oldPassword: oldPass, newPassword: newPass });
      toast.success('Đổi mật khẩu thành công!');
      setOldPass(''); setNewPass(''); setConfirm('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="profile-wrap">
      <h2 className="page-title">Tài khoản của tôi</h2>

      {/* Avatar + thông tin cơ bản */}
      <div className="profile-hero">
        <div className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <p className="profile-name">{user?.name}</p>
          <p className="profile-email">{user?.email}</p>
          <span className="profile-role">{user?.role === 'admin' ? '👑 Admin' : '👤 Khách hàng'}</span>
        </div>
      </div>

      <div className="profile-grid">
        {/* Đổi tên */}
        <div className="profile-card">
          <h3>Thông tin cá nhân</h3>
          <form onSubmit={handleUpdateName}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Họ đệm</label>
                <input
                  className="form-input"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Nguyễn Văn"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Tên</label>
                <input
                  className="form-input"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Tuấn"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity: .6 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input
                className="form-input"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Ví dụ: 0912345678"
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Giới tính</label>
                <select className="form-input" value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="nam">Nam</option>
                  <option value="nu">Nữ</option>
                  <option value="khac">Khác</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Ngày sinh</label>
                <input
                  type="date"
                  className="form-input"
                  value={dob}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={e => setDob(e.target.value)}
                />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              Lưu thay đổi
            </button>
          </form>
        </div>

        {/* Đổi mật khẩu */}
        <div className="profile-card">
          <h3>Đổi mật khẩu</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Mật khẩu hiện tại</label>
              <input className="form-input" type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu mới</label>
              <input className="form-input" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <input className="form-input" type="password" value={confirmPass} onChange={e => setConfirm(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              Đổi mật khẩu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
