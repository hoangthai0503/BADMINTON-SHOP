import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminLayout from './AdminLayout';
import { useToast } from '../../context/ToastContext';

const AdminBannerPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    tag: '🔥 FLASH SALE',
    title: '',
    sub: '',
    cta: 'Mua ngay',
    ctaLink: '/products',
    ctaColor: '#e94560',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
    image: '',
    order: 0,
    isActive: true
  });

  const fetchBanners = async () => {
    try {
      const res = await axiosInstance.get('/banners/admin/all');
      setBanners(res.data.data);
    } catch {
      toast.error('Lỗi tải danh sách banner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      return toast.info('Vui lòng nhập tên/tiêu đề banner');
    }

    try {
      if (editingId) {
        await axiosInstance.put(`/banners/${editingId}`, formData);
        toast.success('Cập nhật banner thành công!');
      } else {
        await axiosInstance.post('/banners', formData);
        toast.success('Thêm banner thành công!');
      }
      resetForm();
      fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (b) => {
    setEditingId(b._id);
    setFormData({
      tag: b.tag,
      title: b.title,
      sub: b.sub,
      cta: b.cta,
      ctaLink: b.ctaLink,
      ctaColor: b.ctaColor,
      bg: b.bg,
      image: b.image,
      order: b.order,
      isActive: b.isActive
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa banner này?')) return;
    try {
      await axiosInstance.delete(`/banners/${id}`);
      toast.success('Đã xóa banner');
      fetchBanners();
    } catch {
      toast.error('Lỗi khi xóa');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      tag: '🔥 FLASH SALE', title: '', sub: '', cta: 'Mua ngay', ctaLink: '/products',
      ctaColor: '#e94560', bg: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)', image: '', order: 0, isActive: true
    });
  };

  return (
    <AdminLayout pageTitle="Quản lý Banners">
      <div className="adm-section-card" style={{ marginBottom: 24, padding: 24 }}>
        <h3 style={{ marginBottom: 16 }}>{editingId ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}</h3>
        <form onSubmit={handleSubmit} className="form-grid-2">
          
          <div className="form-group">
            <label className="form-label">Tiêu đề (title, dùng \n để xuống dòng)</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-input" placeholder="Ví dụ: Siêu Giảm Giá\nHôm Nay" required />
          </div>

          <div className="form-group">
            <label className="form-label">Phụ đề (sub)</label>
            <input type="text" name="sub" value={formData.sub} onChange={handleChange} className="form-input" placeholder="Giảm đến 50%..." />
          </div>

          <div className="form-group">
            <label className="form-label">Badge Tag (vd: 🔥 FLASH SALE)</label>
            <input type="text" name="tag" value={formData.tag} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Link ảnh (tùy chọn)</label>
            <input type="text" name="image" value={formData.image} onChange={handleChange} className="form-input" placeholder="VD: https://picsum.photos/500/220" />
          </div>

          <div className="form-group">
            <label className="form-label">Tên nút (CTA)</label>
            <input type="text" name="cta" value={formData.cta} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Code màu nút (CTA Color)</label>
            <input type="text" name="ctaColor" value={formData.ctaColor} onChange={handleChange} className="form-input" placeholder="#e94560" />
          </div>

          <div className="form-group">
            <label className="form-label">Màu nền / Code CSS Gradient</label>
            <input type="text" name="bg" value={formData.bg} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Link chuyển đến (URL)</label>
            <input type="text" name="ctaLink" value={formData.ctaLink} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label className="form-label" style={{ margin: 0, width: 80 }}>Thứ tự:</label>
            <input type="number" name="order" value={formData.order} onChange={handleChange} className="form-input" style={{ width: 80 }} />
            
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 20, cursor: 'pointer' }}>
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
              <span className="form-label" style={{ margin: 0 }}>Đang hoạt động (Hiển thị)</span>
            </label>
          </div>

          <div className="form-actions col-span-2">
            <button type="submit" className="btn btn-primary">{editingId ? 'Cập nhật' : 'Thêm mới'}</button>
            {editingId && <button type="button" onClick={resetForm} className="btn btn-outline">Hủy sửa</button>}
          </div>
        </form>
      </div>

      <div className="adm-section-card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: 0 }}>Danh sách Banner</h3>
        </div>
        
        {loading ? <p className="loading">Đang tải...</p> : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Ảnh / Màu Nền</th>
                <th>Tiêu đề / Tag</th>
                <th>Nút & Link</th>
                <th>Thứ tự</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {banners.map(b => (
                <tr key={b._id}>
                  <td>
                    <div style={{ width: 80, height: 40, background: b.bg, borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                      {b.image && <img src={b.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="banner img" />}
                    </div>
                  </td>
                  <td>
                    <strong style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>{b.title.split('\\n').join(' ')}</strong>
                    <span className="adm-code">{b.tag}</span>
                  </td>
                  <td>
                    <span style={{ background: b.ctaColor, color: '#fff', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{b.cta}</span>
                    <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{b.ctaLink}</div>
                  </td>
                  <td><span className="adm-badge" style={{ background: '#e2e8f0', color: '#475569' }}>{b.order}</span></td>
                  <td>
                    {b.isActive 
                      ? <span className="adm-badge adm-badge-paid">Hiện</span>
                      : <span className="adm-badge adm-badge-cancelled">Ẩn</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleEdit(b)} className="btn btn-sm btn-outline">Sửa</button>
                      <button onClick={() => handleDelete(b._id)} className="btn btn-sm btn-danger">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {banners.length === 0 && (
                <tr><td colSpan="6" className="empty-state">Chưa có banner nào</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBannerPage;
