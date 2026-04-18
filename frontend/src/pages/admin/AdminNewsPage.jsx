// AdminNewsPage.jsx — Quản lý tin tức / blog

import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminLayout from './AdminLayout';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = ['Khuyến mãi', 'Xu hướng', 'Mẹo hay', 'Thời trang', 'Công nghệ', 'Gia dụng'];

const TAG_COLORS = {
  'Khuyến mãi': '#e8491d',
  'Xu hướng':   '#7c3aed',
  'Mẹo hay':    '#059669',
  'Thời trang': '#db2777',
  'Công nghệ':  '#0284c7',
  'Gia dụng':   '#d97706',
};

const LIMIT = 10;

const emptyForm = {
  title: '', summary: '', content: '', image: '',
  category: ['Xu hướng'], readTime: '3 phút đọc',
  isFeatured: false, isPublished: true,
  couponCode: '',
};

const AdminNewsPage = () => {
  const [news, setNews]           = useState([]);
  const [form, setForm]           = useState(emptyForm);
  const [coupons, setCoupons]     = useState([]);
  const [editId, setEditId]       = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImg, setPreviewImg] = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const [search, setSearch]       = useState('');
  const [filterCat, setFilterCat] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    axiosInstance.get('/coupons/public').then(res => setCoupons(res.data.data)).catch(() => {});
  }, []);

  const fetchNews = useCallback(async () => {
    try {
      const params = { page, limit: LIMIT };
      if (search)    params.search   = search;
      if (filterCat) params.category = filterCat;
      const res = await axiosInstance.get('/news/admin/all', { params });
      const d = res.data.data;
      setNews(d.news);
      setTotalPages(d.totalPages);
      setTotal(d.total);
    } catch (err) { console.error(err); }
  }, [page, search, filterCat]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const handleEdit = (n) => {
    setEditId(n._id);
    setForm({
      title: n.title, summary: n.summary || '', content: n.content || '',
      image: n.image || '', category: Array.isArray(n.category) ? n.category : [n.category], 
      readTime: n.readTime || '3 phút đọc',
      isFeatured: n.isFeatured, isPublished: n.isPublished,
      couponCode: n.couponCode || '',
    });
    setPreviewImg(n.image || '');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewImg(URL.createObjectURL(file));
    const data = new FormData();
    data.append('image', file);
    setUploading(true);
    try {
      const res = await axiosInstance.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(f => ({ ...f, image: res.data.data.url }));
      toast.success('Upload ảnh thành công');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload thất bại');
      setPreviewImg('');
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await axiosInstance.put(`/news/${editId}`, form);
        toast.success('Cập nhật bài viết thành công!');
      } else {
        await axiosInstance.post('/news', form);
        toast.success('Thêm bài viết thành công!');
      }
      setForm(emptyForm); setEditId(null); setShowForm(false); setPreviewImg('');
      fetchNews();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Xóa bài viết "${title}"?`)) return;
    try {
      await axiosInstance.delete(`/news/${id}`);
      toast.success('Đã xóa bài viết');
      fetchNews();
    } catch (err) { toast.error(err.response?.data?.message || 'Xóa thất bại'); }
  };

  const handleTogglePublish = async (n) => {
    try {
      await axiosInstance.put(`/news/${n._id}`, { isPublished: !n.isPublished });
      toast.success(n.isPublished ? 'Đã ẩn bài viết' : 'Đã hiện bài viết');
      fetchNews();
    } catch { toast.error('Lỗi'); }
  };

  const handleCancel = () => {
    setForm(emptyForm); setEditId(null); setShowForm(false); setPreviewImg('');
  };

  return (
    <AdminLayout pageTitle="Quản lý tin tức">
      <div className="adm-section-card">

        {/* Top bar */}
        <div className="adm-top-bar">
          <h2>
            Danh sách bài viết{' '}
            <span style={{ fontWeight: 400, fontSize: 13, color: '#94a3b8' }}>({total})</span>
          </h2>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              className="form-input"
              style={{ width: 200, margin: 0 }}
              placeholder="🔍 Tìm theo tiêu đề..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            <select
              value={filterCat}
              onChange={e => { setFilterCat(e.target.value); setPage(1); }}
              style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: '#fff', cursor: 'pointer' }}
            >
              <option value="">Tất cả thể loại</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              className="adm-add-btn"
              onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); setPreviewImg(''); }}
            >
              {showForm && !editId ? '✕ Đóng' : '+ Thêm bài viết'}
            </button>
          </div>
        </div>

        {/* Form thêm / sửa */}
        {showForm && (
          <div className="adm-form-wrap">
            <h3>{editId ? '✏️ Cập nhật bài viết' : '➕ Thêm bài viết mới'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid-2">

                {/* Tiêu đề */}
                <div className="form-group col-span-2">
                  <label className="form-label">Tiêu đề *</label>
                  <input
                    className="form-input"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Tiêu đề bài viết..."
                    required
                  />
                </div>

                {/* Thể loại (Checkbox mode) */}
                <div className="form-group col-span-2">
                  <label className="form-label">Thể loại (Chọn nhiều)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1.5px solid #e2e8f0' }}>
                    {CATEGORIES.map(c => (
                      <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: form.category.includes(c) ? '#e8491d' : '#475569' }}>
                        <input
                          type="checkbox"
                          checked={form.category.includes(c)}
                          onChange={e => {
                            const checked = e.target.checked;
                            setForm(prev => {
                              const newCats = checked 
                                ? [...prev.category, c] 
                                : prev.category.filter(item => item !== c);
                              return { ...prev, category: newCats };
                            });
                          }}
                          style={{ width: 15, height: 15, accentColor: '#e8491d' }}
                        />
                        {c}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Thời gian đọc */}
                <div className="form-group">
                  <label className="form-label">Thời gian đọc</label>
                  <input
                    className="form-input"
                    value={form.readTime}
                    onChange={e => setForm({ ...form, readTime: e.target.value })}
                    placeholder="VD: 3 phút đọc"
                  />
                </div>

                {/* Ảnh */}
                <div className="form-group col-span-2">
                  <label className="form-label">Ảnh bìa</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <label style={{
                      padding: '7px 14px', background: '#f1f5f9', border: '1px solid #e2e8f0',
                      borderRadius: 6, fontSize: 13, cursor: uploading ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap', opacity: uploading ? 0.6 : 1,
                    }}>
                      {uploading ? '⏳ Đang upload...' : '📁 Chọn file'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploading} />
                    </label>
                    <input
                      className="form-input"
                      value={form.image}
                      onChange={e => { setForm({ ...form, image: e.target.value }); setPreviewImg(e.target.value); }}
                      placeholder="hoặc dán URL ảnh..."
                      style={{ flex: 1 }}
                    />
                  </div>
                  {(previewImg || form.image) && (
                    <img
                      src={previewImg || form.image}
                      alt="preview"
                      onError={e => { e.target.style.display = 'none'; }}
                      style={{ width: 120, height: 75, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                  )}
                </div>

                {/* Tóm tắt */}
                <div className="form-group col-span-2">
                  <label className="form-label">Tóm tắt</label>
                  <textarea
                    className="form-input"
                    value={form.summary}
                    onChange={e => setForm({ ...form, summary: e.target.value })}
                    rows={2}
                    placeholder="Mô tả ngắn hiển thị ở trang danh sách..."
                  />
                </div>

                {/* Nội dung */}
                <div className="form-group col-span-2">
                  <label className="form-label">Nội dung đầy đủ <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: 12 }}>(tuỳ chọn)</span></label>
                  <textarea
                    className="form-input"
                    value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })}
                    rows={5}
                    placeholder="Nội dung chi tiết của bài viết..."
                  />
                </div>

                {/* Checkboxes */}
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: '#e8491d' }}
                    />
                    ⭐ Bài nổi bật
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={e => setForm({ ...form, isPublished: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: '#10b981' }}
                    />
                    ✅ Công khai
                  </label>
                </div>

                {/* Voucher liên kết */}
                <div className="form-group col-span-2" style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                  <label className="form-label" style={{ color: '#e8491d', fontWeight: 'bold' }}>🎟️ Khuyến mãi kèm theo (Tùy chọn)</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <select
                      className="form-input"
                      style={{ width: 140 }}
                      value={form.couponCode !== '' ? 'yes' : 'no'}
                      onChange={e => {
                        if (e.target.value === 'no') {
                          setForm({ ...form, couponCode: '' });
                        } else {
                          // Nếu chưa có mã thì gán một giá trị nháp hoặc lấy mã đầu tiên
                          const firstCode = coupons.length > 0 ? coupons[0].code : 'MA_GIAM_GIA';
                          setForm({ ...form, couponCode: form.couponCode || firstCode });
                        }
                      }}
                    >
                      <option value="no">Không gắn</option>
                      <option value="yes">Gắn voucher</option>
                    </select>

                    {form.couponCode !== '' && (
                      <div style={{ flex: 1 }}>
                         <input
                          className="form-input"
                          placeholder="Nhập mã voucher (VD: SALE50)..."
                          value={form.couponCode}
                          onChange={e => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
                          list="voucher-list"
                        />
                        <datalist id="voucher-list">
                          {coupons.map(c => (
                            <option key={c._id} value={c.code}>
                              {c.name} ({c.discountType === 'percent' ? `-${c.value}%` : `-${c.value.toLocaleString()}đ`})
                            </option>
                          ))}
                        </datalist>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                    Hộp quà Voucher sẽ tự động hiện ở cuối bài viết để khách nhấn Nhận.
                  </p>
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

        {/* Bảng bài viết */}
        <table className="adm-table" style={{ marginBottom: 0 }}>
          <thead>
            <tr>
              {['Ảnh', 'Tiêu đề', 'Thể loại', 'Thời gian đọc', 'Nổi bật', 'Trạng thái', 'Thao tác'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {news.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Chưa có bài viết nào</td></tr>
            ) : news.map(n => (
              <tr key={n._id} style={{ opacity: n.isPublished ? 1 : 0.55 }}>
                <td>
                  <img
                    src={n.image || 'https://placehold.co/60x40'}
                    alt=""
                    style={{ width: 72, height: 48, objectFit: 'cover', borderRadius: 6 }}
                    onError={e => { e.target.src = 'https://placehold.co/60x40'; }}
                  />
                </td>
                <td style={{ maxWidth: 260 }}>
                  <strong style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {n.title}
                  </strong>
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 180 }}>
                    {Array.isArray(n.category) ? n.category.map(cat => (
                      <span key={cat} style={{
                        display: 'inline-block', padding: '1px 8px', borderRadius: 20,
                        fontSize: 11, fontWeight: 700,
                        background: (TAG_COLORS[cat] || '#666') + '18',
                        color: TAG_COLORS[cat] || '#666',
                      }}>
                        {cat}
                      </span>
                    )) : (
                      <span style={{
                        display: 'inline-block', padding: '1px 8px', borderRadius: 20,
                        fontSize: 11, fontWeight: 700,
                        background: (TAG_COLORS[n.category] || '#666') + '18',
                        color: TAG_COLORS[n.category] || '#666',
                      }}>
                        {n.category}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ color: '#6b7280', fontSize: 13 }}>{n.readTime}</td>
                <td style={{ textAlign: 'center' }}>{n.isFeatured ? '⭐' : '—'}</td>
                <td>
                  <span className={`adm-badge ${n.isPublished ? 'adm-badge-paid' : 'adm-badge-cancelled'}`}>
                    {n.isPublished ? 'Công khai' : 'Đã ẩn'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm" style={{ background: '#3b82f6', color: '#fff' }} onClick={() => handleEdit(n)}>Sửa</button>
                    <button
                      className="btn btn-sm"
                      style={{ background: n.isPublished ? '#f59e0b' : '#10b981', color: '#fff' }}
                      onClick={() => handleTogglePublish(n)}
                    >{n.isPublished ? 'Ẩn' : 'Hiện'}</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(n._id, n.title)}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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

export default AdminNewsPage;
