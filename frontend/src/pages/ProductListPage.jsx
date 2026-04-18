import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';
import Banner from '../components/Banner';


const PRICE_RANGES = [
  { label: 'Tất cả mức giá', min: '', max: '' },
  { label: 'Dưới 200.000đ',   min: '',       max: '200000'  },
  { label: '200k – 500k',     min: '200000',  max: '500000'  },
  { label: '500k – 1.000k',   min: '500000',  max: '1000000' },
  { label: 'Trên 1 triệu',    min: '1000000', max: ''        },
];

const ProductListPage = () => {
  const location = useLocation();

  const [products, setProducts]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(false);

  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [categories, setCategories] = useState([]); // danh mục đang được chọn lọc
  const [dbCategories, setDbCategories] = useState([]); // danh mục lấy từ DB
  const [priceIdx, setPriceIdx]   = useState(0);
  const [sort, setSort]           = useState('');
  const [tab, setTab]             = useState('all');

  // Fetch danh mục từ DB cho sidebar filter
  useEffect(() => {
    axiosInstance.get('/categories').then(res => {
      setDbCategories(res.data.data.map(c => c.name));
    }).catch(() => {});
  }, []);

  // Đọc query params từ URL (navbar menu click)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    const q   = params.get('search');
    
    // Reset tab nếu bấm từ Navbar (Tất cả sản phẩm)
    if (!cat && !q && categories.length === 1) {
       setCategories([]);
    }
    
    if (cat) { setCategories([cat]); setTab('all'); }
    if (q) setSearch(q);
    else if (!q && search) setSearch('');
  }, [location.search]);

  useEffect(() => { fetchProducts(); }, [page, sort, search, categories, priceIdx, tab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search)              params.search   = search;
      if (categories.length > 0) params.categories = categories.join(',');
      if (PRICE_RANGES[priceIdx].min) params.minPrice = PRICE_RANGES[priceIdx].min;
      if (PRICE_RANGES[priceIdx].max) params.maxPrice = PRICE_RANGES[priceIdx].max;
      if (sort)                params.sort     = sort;
      if (tab !== 'all')       params.tab      = tab;
      const res = await axiosInstance.get('/products', { params });
      setProducts(res.data.data.products);
      setTotal(res.data.data.total);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (cat) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setPage(1);
  };

  const hasFilter = categories.length > 0 || priceIdx !== 0 || sort !== '' || search !== '' || tab !== 'all';

  const clearAll = () => {
    setCategories([]); setPriceIdx(0); setSort(''); setSearch(''); setTab('all'); setPage(1);
  };

  return (
    <div className="pl-root">


      <div className="pl-body">
        {/* ══ SIDEBAR ══ */}
        <aside className="pl-sidebar">

          {/* Lọc theo giá */}
          <div className="sb-section">
            <p className="sb-title">CHỌN MỨC GIÁ</p>
            {PRICE_RANGES.map((r, i) => (
              <label key={i} className="sb-checkbox-row">
                <input
                  type="radio"
                  name="price"
                  checked={priceIdx === i}
                  onChange={() => { setPriceIdx(i); setPage(1); }}
                  className="sb-radio"
                />
                <span className={priceIdx === i ? 'sb-cb-label active' : 'sb-cb-label'}>{r.label}</span>
              </label>
            ))}
          </div>

          {/* Lọc theo danh mục */}
          <div className="sb-section">
            <p className="sb-title">DANH MỤC</p>
            {dbCategories.map(cat => (
              <label key={cat} className="sb-checkbox-row">
                <input
                  type="checkbox"
                  checked={categories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="sb-checkbox"
                />
                <span className={categories.includes(cat) ? 'sb-cb-label active' : 'sb-cb-label'}>{cat}</span>
              </label>
            ))}
          </div>

          {/* Sắp xếp */}
          <div className="sb-section">
            <p className="sb-title">SẮP XẾP THEO</p>
            {[['', 'Mặc định'], ['price_asc', 'Giá tăng dần'], ['price_desc', 'Giá giảm dần']].map(([val, label]) => (
              <label key={val} className="sb-checkbox-row">
                <input type="radio" name="sort" checked={sort === val} onChange={() => { setSort(val); setPage(1); }} className="sb-radio" />
                <span className={sort === val ? 'sb-cb-label active' : 'sb-cb-label'}>{label}</span>
              </label>
            ))}
          </div>

          {hasFilter && (
            <button className="sb-clear-btn" onClick={clearAll}>✕ Bỏ tất cả bộ lọc</button>
          )}
        </aside>

        {/* ══ MAIN ══ */}
        <section className="pl-main">
          {/* Banner */}
          <Banner />

          {/* Breadcrumb (moved here) */}
          <div className="breadcrumb" style={{ padding: '8px 0', fontSize: '12px' }}>
            <span>Trang chủ</span>
            <span className="bc-sep" style={{ margin: '0 6px' }}>›</span>
            <span className="bc-cur">
              {categories.length > 0 ? categories.join(', ') : tab === 'new' ? 'Sản phẩm mới' : tab === 'discount' ? 'Khuyến mãi' : tab === 'bestseller' ? 'Bán chạy' : 'Tất cả sản phẩm'}
            </span>
          </div>

          {/* Title / Tabs */}
          <div className="pl-toolbar">
            {categories.length > 0 ? (
              <h2 className="pl-heading">
                {categories.join(', ').toUpperCase()}
                <span className="pl-count-badge">{total} sản phẩm</span>
              </h2>
            ) : (
              <div className="pl-tabs-heading">
                <button className={`pl-tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => { setTab('all'); setPage(1); }}>TẤT CẢ SẢN PHẨM</button>
                <button className={`pl-tab-btn ${tab === 'new' ? 'active' : ''}`} onClick={() => { setTab('new'); setPage(1); }}>MỚI NHẤT</button>
                <button className={`pl-tab-btn ${tab === 'discount' ? 'active' : ''}`} onClick={() => { setTab('discount'); setPage(1); }}>GIẢM GIÁ</button>
                <button className={`pl-tab-btn ${tab === 'bestseller' ? 'active' : ''}`} onClick={() => { setTab('bestseller'); setPage(1); }}>BÁN CHẠY</button>
                <span className="pl-count-badge" style={{marginLeft: 'auto', marginRight: '16px'}}>{total} sản phẩm</span>
              </div>
            )}
            
            <div className="sort-chips">
              {[['', 'Mặc định'], ['price_asc', 'Giá ↑'], ['price_desc', 'Giá ↓']].map(([val, label]) => (
                <button
                  key={val}
                  className={`sort-chip ${sort === val ? 'active' : ''}`}
                  onClick={() => { setSort(val); setPage(1); }}
                >{label}</button>
              ))}
            </div>
          </div>

          {/* Grid sản phẩm */}
          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 12 }).map((_, i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="pl-empty">
              <p>😕 Không tìm thấy sản phẩm nào</p>
              <button className="sb-clear-btn" style={{ margin: '12px auto', display: 'block' }} onClick={clearAll}>Xóa bộ lọc</button>
            </div>
          ) : (
            <div className="product-grid">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {/* Phân trang */}
          {!loading && totalPages > 1 && (
            <div className="pagination">
              <button className="pg-arrow" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="pg-arrow" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductListPage;
