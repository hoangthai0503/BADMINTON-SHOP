// AdminCategoryPage.jsx — Quản lý danh mục sản phẩm

import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminLayout from './AdminLayout';
import { useToast } from '../../context/ToastContext';

const EMOJI_LIST = ['📦', '👗', '📱', '👟', '🏠', '⌚', '📚', '🎮', '🍳', '💄', '🧸', '🎒', '🖥️', '🏋️', '🌿', '🎵'];

const emptyForm = { name: '', icon: '📦', description: '' };

const PAGE_SIZE = 8;

const AdminCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm]             = useState(emptyForm);
  const [editId, setEditId]         = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const { toast } = useToast();

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/categories?all=true');
      setCategories(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setForm({ name: cat.name, icon: cat.icon || '📦', description: cat.description || '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await axiosInstance.put(`/categories/${editId}`, form);
        toast.success('Cập nhật danh mục thành công!');
      } else {
        await axiosInstance.post('/categories', form);
        toast.success('Thêm danh mục thành công!');
      }
      setForm(emptyForm); setEditId(null); setShowForm(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi');
    } finally { setLoading(false); }
  };

  const handleToggleActive = async (cat) => {
    try {
      await axiosInstance.put(`/categories/${cat._id}`, { isActive: !cat.isActive });
      toast.success(cat.isActive ? 'Đã ẩn danh mục' : 'Đã hiện danh mục');
      fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Xóa danh mục "${cat.name}"?`)) return;
    try {
      await axiosInstance.delete(`/categories/${cat._id}`);
      toast.success('Đã xóa danh mục');
      fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Xóa thất bại'); }
  };

  const handleCancel = () => { setForm(emptyForm); setEditId(null); setShowForm(false); setShowEmojiPicker(false); };

  const activeCount   = categories.filter(c => c.isActive).length;
  const inactiveCount = categories.length - activeCount;

  // Client-side filter + pagination
  const filtered   = search
    ? categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : categories;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedCats  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AdminLayout pageTitle="Quản lý danh mục">

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Tổng danh mục', value: categories.length, icon: '🗂️', color: '#6366f1' },
          { label: 'Đang hiển thị', value: activeCount, icon: '✅', color: '#10b981' },
          { label: 'Đã ẩn', value: inactiveCount, icon: '🚫', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="adm-stat-card">
            <div className="adm-stat-icon" style={{ background: s.color + '1a', color: s.color }}>{s.icon}</div>
            <div>
              <p className="adm-stat-value" style={{ color: s.color }}>{s.value}</p>
              <p className="adm-stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-section-card">
        {/* Tiêu đề + nút thêm */}
        <div className="adm-top-bar">
          <h2>
            Danh sách danh mục{' '}
            <span style={{ fontWeight: 400, fontSize: 13, color: '#94a3b8' }}>({filtered.length})</span>
          </h2>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              className="form-input"
              style={{ width: 200, margin: 0 }}
              placeholder="🔍 Tìm theo tên..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            <button className="adm-add-btn" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}>
              {showForm && !editId ? '✕ Đóng' : '+ Thêm danh mục'}
            </button>
          </div>
        </div>

        {/* Form thêm / sửa */}
        {showForm && (
          <div className="adm-form-wrap">
            <h3>{editId ? '✏️ Cập nhật danh mục' : '➕ Thêm danh mục mới'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid-2">

                {/* Icon picker */}
                <div className="form-group">
                  <label className="form-label">Icon đại diện</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(s => !s)}
                      style={{
                        width: 52, height: 52, fontSize: 26, border: '1.5px solid #e0e0e0',
                        borderRadius: 10, background: '#fafafa', cursor: 'pointer',
                      }}
                    >{form.icon}</button>
                    <span style={{ fontSize: 12, color: '#999' }}>Bấm để chọn icon</span>
                  </div>
                  {showEmojiPicker && (
                    <div style={{
                      marginTop: 8, padding: 10, background: '#fff', border: '1px solid #e0e0e0',
                      borderRadius: 10, display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 280,
                    }}>
                      {EMOJI_LIST.map(em => (
                        <button
                          key={em} type="button"
                          onClick={() => { setForm(f => ({ ...f, icon: em })); setShowEmojiPicker(false); }}
                          style={{
                            width: 38, height: 38, fontSize: 20, border: '1px solid',
                            borderColor: form.icon === em ? '#e8491d' : '#e0e0e0',
                            borderRadius: 8, background: form.icon === em ? '#fff3ef' : '#fafafa',
                            cursor: 'pointer',
                          }}
                        >{em}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tên danh mục */}
                <div className="form-group">
                  <label className="form-label">Tên danh mục *</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ví dụ: Thời trang"
                    required
                  />
                </div>

                {/* Mô tả */}
                <div className="form-group col-span-2">
                  <label className="form-label">Mô tả ngắn</label>
                  <input
                    className="form-input"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Mô tả ngắn về danh mục (tuỳ chọn)"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Đang lưu...' : (editId ? 'Cập nhật' : 'Thêm mới')}
                </button>
                <button type="button" className="btn btn-outline" onClick={handleCancel}>Hủy</button>
              </div>
            </form>
          </div>
        )}

        {/* Bảng danh mục */}
        {categories.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗂️</div>
            <p>Chưa có danh mục nào. Nhấn "Thêm danh mục" để bắt đầu.</p>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                {['Icon', 'Tên danh mục', 'Mô tả', 'Sản phẩm', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedCats.map(cat => (
                <tr key={cat._id} style={{ opacity: cat.isActive ? 1 : 0.55 }}>
                  <td>
                    <div style={{
                      width: 40, height: 40, fontSize: 22,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#f3f4f6', borderRadius: 8,
                    }}>{cat.icon}</div>
                  </td>
                  <td><strong>{cat.name}</strong></td>
                  <td style={{ color: '#6b7280', maxWidth: 200 }}>
                    {cat.description || <span style={{ color: '#d1d5db' }}>—</span>}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block', padding: '2px 10px',
                      background: '#f3f4f6', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    }}>
                      {/* Hiển thị placeholder — thực tế cần đếm từ products */}
                      —
                    </span>
                  </td>
                  <td>
                    <span className={`adm-badge ${cat.isActive ? 'adm-badge-paid' : 'adm-badge-cancelled'}`}>
                      {cat.isActive ? 'Hiển thị' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-sm"
                        style={{ background: '#3b82f6', color: '#fff' }}
                        onClick={() => handleEdit(cat)}
                      >Sửa</button>
                      <button
                        className="btn btn-sm"
                        style={{ background: cat.isActive ? '#f59e0b' : '#10b981', color: '#fff' }}
                        onClick={() => handleToggleActive(cat)}
                      >{cat.isActive ? 'Ẩn' : 'Hiện'}</button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(cat)}
                      >Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="pagination" style={{ padding: '16px 0 4px' }}>
            <button className="btn-page" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Trước</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`btn-page ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="btn-page" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Sau →</button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCategoryPage;
