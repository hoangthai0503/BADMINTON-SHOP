// AdminProductPage.jsx — Quản lý sản phẩm: CRUD bằng bảng + form

import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminLayout from './AdminLayout';
import { useToast } from '../../context/ToastContext';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const emptyForm = { name: '', description: '', price: '', originalPrice: '', discountPercent: '', image: '', category: '', stock: '', colors: '', sizes: '' };

const AdminProductPage = () => {
  const LIMIT = 10;
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm]             = useState(emptyForm);
  const [editId, setEditId]         = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [previewImg, setPreviewImg] = useState('');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [search, setSearch]         = useState('');
  const [tab, setTab]               = useState('all');
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      const params = { page, limit: LIMIT, all: true };
      if (search) params.search = search;
      if (tab !== 'all') params.tab = tab;
      const res = await axiosInstance.get('/products', { params });
      setProducts(res.data.data.products);
      setTotalPages(res.data.data.totalPages);
      setTotal(res.data.data.total);
    } catch (err) { console.error(err); }
  }, [page, search, tab]);

  useEffect(() => {
    fetchProducts();
    axiosInstance.get('/categories?all=true')
      .then(res => setCategories(res.data.data.filter(c => c.isActive)))
      .catch(() => {});
  }, [page, search, tab, fetchProducts]);

  const handleEdit = (p) => {
    setEditId(p._id);
    const hasDiscount = p.originalPrice && p.originalPrice > p.price;
    setForm({
      name: p.name,
      description: p.description || '',
      // Giá gốc = originalPrice nếu có giảm giá, ngược lại = price (giá bán thông thường)
      originalPrice: hasDiscount ? p.originalPrice : p.price,
      // Giá giảm = price nếu có giảm giá, ngược lại để là 0
      price: hasDiscount ? p.price : 0,
      discountPercent: hasDiscount ? Math.round((1 - p.price / p.originalPrice) * 100) : 0,
      image: p.image || '',
      category: p.category || '',
      stock: p.stock,
      colors: p.colors ? p.colors.join(', ') : '',
      sizes: p.sizes ? p.sizes.join(', ') : '',
    });
    setPreviewImg(p.image || '');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Upload file ảnh lên server, lấy URL trả về điền vào form.image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Xem trước ảnh ngay lập tức (không cần chờ upload xong)
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
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate: nếu có nhập giá giảm thì phải nhỏ hơn giá gốc
    if (form.price && Number(form.price) >= Number(form.originalPrice)) {
      toast.error('Giá giảm phải nhỏ hơn giá gốc');
      return;
    }
    setLoading(true);
    try {
      // Chuyển đổi dữ liệu form trước khi gửi:
      // - Giá gốc (originalPrice) luôn lưu trong DB
      // - Nếu không có giá giảm → price = originalPrice (giá bán = giá gốc, không KM)
      // - Nếu có giá giảm → price = giá giảm (< originalPrice → FE hiển thị gạch ngang)
      const submitData = { ...form };
      submitData.colors = form.colors ? form.colors.split(',').map(c => c.trim()).filter(c => c) : [];
      submitData.sizes = form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(s => s) : [];
      if (!form.price || Number(form.price) === 0) {
        submitData.price = form.originalPrice;  // giá bán = giá gốc khi không KM
        // KHÔNG null originalPrice — giữ nguyên để FE luôn có giá gốc tham chiếu
      }
      if (editId) {
        await axiosInstance.put(`/products/${editId}`, submitData);
      } else {
        await axiosInstance.post('/products', submitData);
      }
      setForm(emptyForm); setEditId(null); setShowForm(false);
      fetchProducts();
      toast.success(editId ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa sản phẩm "${name}"?`)) return;
    try { await axiosInstance.delete(`/products/${id}`); fetchProducts(); toast.success('Đã xóa sản phẩm'); }
    catch (err) { toast.error(err.response?.data?.message || 'Xóa thất bại'); }
  };

  const handleCancel = () => { setForm(emptyForm); setEditId(null); setShowForm(false); setPreviewImg(''); };

  return (
    <AdminLayout pageTitle="Quản lý sản phẩm">
      <div className="adm-section-card">
        {/* Thanh tiêu đề + nút thêm */}
        <div className="adm-top-bar">
          <h2>Danh sách sản phẩm <span style={{ fontWeight: 400, fontSize: 13, color: '#94a3b8' }}>({total})</span></h2>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <select
                className="form-input"
                style={{ margin: 0, padding: '8px 12px', minWidth: '160px' }}
                value={tab}
                onChange={e => { setTab(e.target.value); setPage(1); }}
              >
                <option value="all">Tất cả sản phẩm</option>
                <option value="discount">Có giảm giá</option>
                <option value="regular">Không giảm giá</option>
              </select>
              <input
                className="form-input"
                style={{ width: 220, margin: 0 }}
                placeholder="🔍 Tìm theo tên..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            <button className="adm-add-btn" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); setPreviewImg(''); }}>
              {showForm && !editId ? '✕ Đóng' : '+ Thêm sản phẩm'}
            </button>
          </div>
        </div>

        {/* Form thêm / sửa */}
        {showForm && (
          <div className="adm-form-wrap">
            <h3>{editId ? '✏️ Cập nhật sản phẩm' : '➕ Thêm sản phẩm mới'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid-2">
                <div className="form-group col-span-2">
                  <label className="form-label">Tên sản phẩm *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Giá gốc (VND) *</label>
                  <input
                    className="form-input"
                    type="text"
                    value={form.originalPrice ? new Intl.NumberFormat('vi-VN').format(form.originalPrice) : ''}
                    onChange={e => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setForm({ ...form, originalPrice: raw ? Number(raw) : '' });
                    }}
                    placeholder="VD: 500.000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Giá giảm (VND)
                    <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: 6, fontSize: 12 }}>— nhập 0 nếu không khuyến mãi</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ position: 'relative', width: '85px', flexShrink: 0 }}>
                      <input 
                        className="form-input" 
                        type="number" min={0} max={100} placeholder="VD: 15"
                        style={{ paddingRight: 24, textAlign: 'center' }}
                        value={form.discountPercent}
                        onChange={e => {
                          const val = e.target.value;
                          const newPct = val === '' ? '' : Number(val);
                          let newPrice = form.price;
                          if (newPct === 0 || newPct === '') {
                            newPrice = 0;
                          } else if (form.originalPrice) {
                            newPrice = Math.floor(form.originalPrice * (1 - newPct / 100));
                          }
                          setForm({ ...form, discountPercent: newPct, price: newPrice });
                        }}
                      />
                      <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#94a3b8', pointerEvents: 'none', fontWeight: 600 }}>%</span>
                    </div>
                    <input 
                      className="form-input" 
                      type="text" 
                      placeholder="Nhập giá giảm..." 
                      style={{ flex: 1 }}
                      value={form.price ? new Intl.NumberFormat('vi-VN').format(form.price) : ''}
                      onChange={e => {
                        const raw = e.target.value.replace(/\D/g, '');
                        const newPrice = raw ? Number(raw) : 0;
                        let newPct = form.discountPercent;
                        if (newPrice === 0) {
                          newPct = 0;
                        } else if (form.originalPrice && form.originalPrice > newPrice) {
                          newPct = Math.round((1 - newPrice / form.originalPrice) * 100);
                        }
                        setForm({ ...form, price: newPrice, discountPercent: newPct });
                      }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Số lượng kho *</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    value={form.stock !== '' && form.stock !== null ? new Intl.NumberFormat('vi-VN').format(form.stock) : ''} 
                    onChange={e => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setForm({ ...form, stock: raw !== '' ? Number(raw) : '' });
                    }} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Danh mục</label>
                  <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Ảnh sản phẩm</label>
                  {/* Upload file hoặc nhập URL tay */}
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
                  {/* Xem trước ảnh */}
                  {(previewImg || form.image) && (
                    <img
                      src={previewImg || form.image}
                      alt="preview"
                      onError={e => { e.target.style.display = 'none'; }}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                  )}
                </div>
                <div className="form-group col-span-2">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
                </div>
                <div className="form-group">
                  <label className="form-label">Màu sắc (cách nhau bởi phẩy)</label>
                  <input className="form-input" placeholder="Vd: Đỏ, Xanh, Trắng" value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Kích cỡ (cách nhau bởi phẩy)</label>
                  <input className="form-input" placeholder="Vd: S, M, L, XL" value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Đang lưu...' : (editId ? 'Cập nhật' : 'Thêm mới')}</button>
                <button type="button" className="btn btn-outline" onClick={handleCancel}>Hủy</button>
              </div>
            </form>
          </div>
        )}

        {/* Bảng sản phẩm */}
        <table className="adm-table" style={{ marginBottom: 0 }}>
          <thead>
            <tr>
              {['ID', 'Ảnh', 'Tên sản phẩm', 'Danh mục', 'Giá gốc', 'Giá giảm', 'Kho', 'Ngày tạo', 'Trạng thái', 'Thao tác'].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const coGiamGia = p.originalPrice && p.originalPrice > p.price;
              
              return (
              <tr key={p._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', width: 'fit-content' }}>
                    <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', fontWeight: 600 }}>...{p._id.slice(-5)}</span>
                    <button 
                      title="Copy URL để làm Banner"
                      onClick={() => {
                        navigator.clipboard.writeText(`/products/${p._id}`);
                        toast.success('Đã copy đường dẫn: /products/' + p._id);
                      }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', padding: 0 }}
                    >
                      📋
                    </button>
                  </div>
                </td>
                <td><img src={p.image || 'https://placehold.co/56x56'} alt="" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6 }} /></td>
                <td><strong>{p.name}</strong></td>
                <td style={{ color: '#6b7280' }}>{p.category || '—'}</td>
                
                <td style={{ color: coGiamGia ? '#94a3b8' : '#334155', textDecoration: coGiamGia ? 'line-through' : 'none' }}>
                  {formatPrice(p.originalPrice || p.price)}
                </td>
                <td style={{ fontWeight: 700, color: coGiamGia ? '#e8491d' : '#94a3b8' }}>
                  {coGiamGia ? formatPrice(p.price) : '—'}
                </td>
                
                <td>{p.stock}</td>
                <td style={{ color: '#64748b', fontSize: '12.5px' }}>{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
                <td><span className={`adm-badge ${p.isActive ? 'adm-badge-paid' : 'adm-badge-cancelled'}`}>{p.isActive ? 'Đang bán' : 'Đã ẩn'}</span></td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm" style={{ background: '#3b82f6', color: '#fff' }} onClick={() => handleEdit(p)}>Sửa</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id, p.name)}>Xóa</button>
                </td>
              </tr>
              );
            })}
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

export default AdminProductPage;
