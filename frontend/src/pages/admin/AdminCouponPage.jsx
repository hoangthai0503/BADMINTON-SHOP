import { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminLayout from './AdminLayout';
import { useToast } from '../../context/ToastContext';

const AdminCouponPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    discountType: 'percent',
    value: '',
    minOrder: 0,
    maxDiscount: '',
    applicableProducts: [],
    allowDiscounted: false,
    isActive: true,
    expiresAt: ''
  });

  // Tìm kiếm sản phẩm
  const [productSearch, setProductSearch] = useState('');
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProductsDisplay, setSelectedProductsDisplay] = useState([]); // {id, name}
  const debounceRef = useRef(null);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/coupons');
      setCoupons(res.data.data);
    } catch {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  // Effect tìm kiếm sản phẩm
  useEffect(() => {
    if (!productSearch.trim()) { setProductOptions([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axiosInstance.get('/products', { params: { search: productSearch.trim(), limit: 5 } });
        setProductOptions(res.data.data.products);
      } catch { setProductOptions([]); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [productSearch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };



  const addProduct = (p) => {
    if (formData.applicableProducts.includes(p._id)) return;
    setFormData(prev => ({ ...prev, applicableProducts: [...prev.applicableProducts, p._id] }));
    setSelectedProductsDisplay(prev => [...prev, { _id: p._id, name: p.name }]);
    setProductSearch('');
    setProductOptions([]);
  };

  const removeProduct = (id) => {
    setFormData(prev => ({ ...prev, applicableProducts: prev.applicableProducts.filter(pid => pid !== id) }));
    setSelectedProductsDisplay(prev => prev.filter(p => p._id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.value) {
      return toast.info('Vui lòng nhập Tên Voucher và giá trị giảm');
    }

    const payload = { ...formData };
    payload.value = Number(payload.value);
    payload.minOrder = Number(payload.minOrder);
    if (payload.maxDiscount) payload.maxDiscount = Number(payload.maxDiscount);
    else delete payload.maxDiscount;
    if (payload.expiresAt) payload.expiresAt = new Date(payload.expiresAt).toISOString();
    else payload.expiresAt = null;

    if (!payload.code) delete payload.code;

    try {
      await axiosInstance.post('/coupons', payload);
      toast.success('Thêm mã giảm giá thành công!');
      resetForm();
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;
    try {
      await axiosInstance.delete(`/coupons/${id}`);
      toast.success('Đã xóa mã giảm giá');
      fetchCoupons();
    } catch {
      toast.error('Lỗi khi xóa');
    }
  };
  
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã: ${code}`);
  };

  const resetForm = () => {
    setProductSearch('');
    setSelectedProductsDisplay([]);
    setFormData({
      name: '', code: '', discountType: 'percent', value: '', minOrder: 0, maxDiscount: '',
      applicableProducts: [], allowDiscounted: false, isActive: true, expiresAt: ''
    });
  };

  return (
    <AdminLayout pageTitle="Quản lý Voucher / Mã giảm giá">
      <div className="adm-section-card" style={{ marginBottom: 24, padding: 24 }}>
        <h3 style={{ marginBottom: 16, color: '#e8491d' }}>Thêm Voucher mới</h3>
        <form onSubmit={handleSubmit} className="form-grid-2">
          
          <div className="form-group col-span-2">
            <label className="form-label">Tên Voucher (Tên hiển thị)</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="Ví dụ: Giảm 10% Tối đa 50k" required />
          </div>

          <div className="form-group">
            <label className="form-label">Mã Code (Để trống hệ thống tự tạo)</label>
            <input type="text" name="code" value={formData.code} onChange={handleChange} className="form-input" placeholder="Tự sinh: VCH-XYZ123" style={{ textTransform: 'uppercase' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Loại giảm giá</label>
            <select name="discountType" value={formData.discountType} onChange={handleChange} className="form-input">
              <option value="percent">Giảm theo phần trăm (%)</option>
              <option value="fixed">Giảm số tiền cố định (đ)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Giá trị giảm ({formData.discountType === 'percent' ? '%' : 'đ'})</label>
            <input type="number" name="value" value={formData.value} onChange={handleChange} className="form-input" placeholder="10" required />
          </div>

          <div className="form-group">
            <label className="form-label">Khấu trừ tối đa (Cho %)</label>
            <input type="number" name="maxDiscount" value={formData.maxDiscount} onChange={handleChange} className="form-input" placeholder="Ví dụ: 100000" />
          </div>

          <div className="form-group">
            <label className="form-label">Đơn tối thiểu áp dụng (đ)</label>
            <input type="number" name="minOrder" value={formData.minOrder} onChange={handleChange} className="form-input" placeholder="0" />
          </div>

          <div className="form-group">
            <label className="form-label">Thời hạn sử dụng</label>
            <input type="datetime-local" name="expiresAt" value={formData.expiresAt} onChange={handleChange} className="form-input" />
          </div>



          <div className="form-group col-span-2" style={{ position: 'relative' }}>
            <label className="form-label">Sản phẩm áp dụng cụ thể (Bỏ trống = Áp dụng tất cả)</label>
            <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)} className="form-input" placeholder="🔎 Gõ tên sản phẩm để tìm và chỉ định..." autoComplete="off" />
            
            {productOptions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: 4, zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {productOptions.map(p => (
                  <div key={p._id} onClick={() => addProduct(p)} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>{p.name}</span> - <span style={{ color: '#e8491d' }}>{p.price.toLocaleString()}đ</span>
                  </div>
                ))}
              </div>
            )}

            {selectedProductsDisplay.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedProductsDisplay.map(p => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffe4e6', color: '#be123c', padding: '6px 12px', borderRadius: 4, fontSize: 13 }}>
                    <span>{p.name}</span>
                    <button type="button" onClick={() => removeProduct(p._id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9f1239', fontWeight: 'bold' }}>✕ Bỏ</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group col-span-2">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              <input type="checkbox" name="allowDiscounted" checked={formData.allowDiscounted} onChange={handleChange} style={{ width: 18, height: 18, accentColor: '#e8491d' }} />
              Cho phép áp dụng chung với sản phẩm đang có giá SALE trên hệ thống
            </label>
            <p style={{ margin: '4px 0 0 26px', fontSize: 12, color: '#64748b' }}>Nếu tắt, voucher sẽ bỏ qua các sản phẩm đang được giảm giá (có gạch ngang).</p>
          </div>

          <div className="form-group col-span-2" style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 'bold' }}>
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
              Trạng thái Hoạt động
            </label>
          </div>

          <div className="form-actions col-span-2">
            <button type="submit" className="btn btn-primary" style={{ minWidth: 140 }}>Thêm mới Voucher</button>
            <button type="button" onClick={resetForm} className="btn btn-outline">Nhập lại</button>
          </div>
        </form>
      </div>

      <div className="adm-section-card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: 0 }}>Danh sách Voucher</h3>
        </div>
        
        {loading ? <p className="loading">Đang tải...</p> : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Tên & Mã</th>
                <th>Giảm giá</th>
                <th>Điều kiện / Hạn mức</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c._id}>
                  <td>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>{c.name || '---'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{ fontFamily: 'monospace', color: '#e8491d', fontSize: 12 }}>{c.code}</span>
                      <button 
                        type="button" 
                        onClick={() => handleCopyCode(c.code)}
                        style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer', color: '#64748b' }}
                      >Copy</button>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: '#e94560', fontWeight: 'bold' }}>
                      {c.discountType === 'percent' ? `Giảm ${c.value}%` : `Giảm ${c.value.toLocaleString()}đ`}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Đơn tối thiểu: {c.minOrder.toLocaleString()}đ</div>
                    {c.maxDiscount && <div style={{ fontSize: 12, color: '#64748b' }}>Giảm tối đa: {c.maxDiscount.toLocaleString()}đ</div>}
                    {!c.allowDiscounted && <div style={{ fontSize: 11, color: '#b91c1c', marginTop: 4, fontWeight: 'bold' }}>✖ Không áp dụng hàng Sale</div>}
                  </td>
                  <td>
                    {c.isActive 
                      ? <span className="adm-badge adm-badge-paid">Hoạt động</span>
                      : <span className="adm-badge adm-badge-cancelled">Ngưng</span>}
                  </td>
                  <td>
                    <button onClick={() => handleDelete(c._id)} className="btn btn-sm btn-danger">Xóa</button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr><td colSpan="5" className="empty-state">Chưa có voucher nào</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCouponPage;
