import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

// Danh mục mặc định khi chưa load xong hoặc DB rỗng
const DEFAULT_CATEGORIES = [
  { label: 'Tất cả sản phẩm', to: '/', icon: '🏷️' },
];

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const Navbar = () => {
  const { isUserLoggedIn, user, logout, cartCount } = useAuth();
  const [searchVal, setSearchVal]       = useState('');
  const [suggestions, setSuggestions]   = useState([]);
  const [showDrop, setShowDrop]         = useState(false);
  const [loadingSug, setLoadingSug]     = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProductDrop, setShowProductDrop] = useState(false);
  const [navCategories, setNavCategories] = useState(DEFAULT_CATEGORIES);
  
  // Voucher state
  const [showVouchers, setShowVouchers] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  
  // Scroll hide/show search
  const [showSearchTier, setShowSearchTier] = useState(true);
  const lastScrollY = useRef(0);

  const navigate       = useNavigate();
  const location       = useLocation();
  const debounceRef    = useRef(null);
  const searchTierRef  = useRef(null);
  const userMenuRef    = useRef(null);
  const productDropRef = useRef(null);
  const voucherBtnRef  = useRef(null);

  // Fetch danh mục từ DB để hiện dropdown Sản phẩm + Fetch Voucher
  useEffect(() => {
    axiosInstance.get('/categories').then(res => {
      const items = [
        { label: 'Tất cả sản phẩm', to: '/products', icon: '🏷️' },
        ...res.data.data.map(c => ({
          label: c.name,
          to: `/products?category=${encodeURIComponent(c.name)}`,
          icon: c.icon || '📦',
        })),
      ];
      setNavCategories(items);
    }).catch(() => {});

    axiosInstance.get('/coupons/public').then(res => {
      setVouchers(res.data.data);
    }).catch(() => {});
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100 && currentScrollY > lastScrollY.current) {
        setShowSearchTier(false);
      } else if (currentScrollY < lastScrollY.current - 5) {
        setShowSearchTier(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounce gợi ý tìm kiếm
  useEffect(() => {
    if (!searchVal.trim()) { setSuggestions([]); setShowDrop(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoadingSug(true);
      try {
        const res = await axiosInstance.get('/products', { params: { search: searchVal.trim(), limit: 6 } });
        setSuggestions(res.data.data.products);
        setShowDrop(true);
      } catch { setSuggestions([]); }
      finally { setLoadingSug(false); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchVal]);

  // Click ra ngoài → đóng tất cả dropdown
  useEffect(() => {
    const handler = (e) => {
      if (searchTierRef.current && !searchTierRef.current.contains(e.target)) setShowDrop(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
      if (productDropRef.current && !productDropRef.current.contains(e.target)) setShowProductDrop(false);
      if (voucherBtnRef.current && !voucherBtnRef.current.contains(e.target)) setShowVouchers(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Listen for external open voucher event (from News page)
  useEffect(() => {
    const handler = () => {
      setShowVouchers(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('OPEN_VOUCHER_WALLET', handler);
    return () => window.removeEventListener('OPEN_VOUCHER_WALLET', handler);
  }, []);

  // Đổi trang → đóng dropdown sản phẩm
  useEffect(() => { setShowProductDrop(false); }, [location.pathname, location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    setShowDrop(false);
    navigate(`/?search=${encodeURIComponent(searchVal.trim())}`);
  };

  const handleSelectSuggestion = (product) => {
    setShowDrop(false);
    setSearchVal('');
    navigate(`/products/${product._id}`);
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  const copyVoucher = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã chép mã: ${code}`);
  };

  return (
    <header className="header-wrap" style={{ transform: showSearchTier ? 'translateY(0)' : 'translateY(-100%)', transition: 'transform 0.3s ease' }}>
      <div className="mainnav">
        <div className="mainnav-inner">

          {/* ── Logo ── */}
          <Link to="/" className="nav-logo">
            <div className="nav-logo-box">🛒</div>
            <span className="nav-logo-text">BADMINTON-SHOP</span>
          </Link>

          {/* ── Nav links ── */}
          <nav className="nav-links">
            <Link to="/" className="nav-link">Trang chủ</Link>

            {/* Dropdown Sản phẩm */}
            <div className="nav-drop-wrap" ref={productDropRef}>
              <button
                className="nav-link nav-link-btn"
                onClick={() => setShowProductDrop(s => !s)}
              >
                Sản phẩm <span className="nav-drop-arrow">{showProductDrop ? '▲' : '▼'}</span>
              </button>
              {showProductDrop && (
                <div className="nav-product-dropdown">
                  {navCategories.map(cat => (
                    <Link
                      key={cat.to}
                      to={cat.to}
                      className="nav-product-dd-item"
                    >
                      <span className="nav-product-dd-icon">{cat.icon}</span>
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/services" className="nav-link">Dịch vụ</Link>
            <Link to="/news" className="nav-link">Tin tức</Link>
            <Link to="/faq" className="nav-link">Câu hỏi thường gặp</Link>
            <Link to="/contact" className="nav-link">Liên hệ</Link>
          </nav>

          {/* ── Right actions ── */}
          <div className="nav-actions">

            {/* Nút Voucher */}
            <div style={{ position: 'relative' }} ref={voucherBtnRef}>
              <button
                className="nav-action-btn"
                onClick={() => setShowVouchers(v => !v)}
                title="Voucher giảm giá"
              >
                <span className="nav-icon-wrap">
                  🎟️
                  {vouchers.length > 0 && (
                    <span className="cart-badge" style={{ background: '#ec4899', right: -6, top: -4 }}>
                      {vouchers.length}
                    </span>
                  )}
                </span>
              </button>
              {showVouchers && (
                <div className="voucher-dropdown">
                  <p className="voucher-title">Ví Voucher</p>
                  {vouchers.length === 0 ? (
                    <div style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: '10px 0' }}>Chưa có voucher khả dụng</div>
                  ) : (
                    vouchers.map(v => (
                      <div key={v._id} className="voucher-item-ui">
                        <div className="voucher-info-box">
                          <span className="voucher-code-txt">{v.code}</span>
                          <span className="voucher-desc-txt">
                            Giảm {v.discountType === 'percent' ? `${v.value}%` : `${v.value.toLocaleString()}đ`}
                            {v.minOrder > 0 && ` (Đơn từ ${v.minOrder / 1000}k)`}
                          </span>
                        </div>
                        <button className="voucher-copy-btn" onClick={() => copyVoucher(v.code)}>Copy</button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Admin không bao giờ hiện giao diện user — coi như chưa đăng nhập */}
            {isUserLoggedIn ? (
                <>
                  {/* Giỏ hàng */}
                  <Link to="/cart" className="nav-action-btn" title="Giỏ hàng">
                    <span className="nav-icon-wrap">
                      🛒
                      {cartCount > 0 && (
                        <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
                      )}
                    </span>
                  </Link>

                  {/* Đơn hàng */}
                  <Link to="/orders" className="nav-action-btn" title="Đơn hàng">
                    📦
                  </Link>

                  <div className="nav-divider" />

                  {/* User dropdown */}
                  <div className="nav-user-wrap" ref={userMenuRef}>
                    <button
                      className="nav-user-btn"
                      onClick={() => setShowUserMenu(s => !s)}
                    >
                      <span>👤</span>
                      <span className="nav-user-name">{user?.name}</span>
                      <span className="nav-user-arrow">{showUserMenu ? '▲' : '▼'}</span>
                    </button>

                    {showUserMenu && (
                      <div className="nav-user-dropdown">
                        <Link
                          to="/profile"
                          className="nav-user-dd-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          👤 Tài khoản
                        </Link>
                        <Link
                          to="/orders"
                          className="nav-user-dd-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          📦 Đơn hàng
                        </Link>
                        <button className="nav-user-dd-item nav-user-dd-logout" onClick={handleLogout}>
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </>
            ) : (
              <>
                <div className="nav-divider" />
                <Link to="/login" className="nav-btn-login">Đăng nhập</Link>
                <Link to="/register" className="nav-btn-register">Đăng ký</Link>
              </>
            )}
          </div>
        </div>

        {/* ── Thanh tìm kiếm (permanent row) ── */}
        <div className="nav-search-tier" ref={searchTierRef}>
          <div className="nav-search-inner">
            <form className="nav-search-form" onSubmit={handleSearch}>
              <input
                className="nav-search-input"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                autoComplete="off"
              />
              <button type="submit" className="nav-search-submit">Tìm</button>
            </form>

              {/* Dropdown gợi ý */}
              {showDrop && (
                <div className="search-dropdown">
                  {loadingSug ? (
                    <div className="search-drop-loading">Đang tìm...</div>
                  ) : suggestions.length === 0 ? (
                    <div className="search-drop-empty">Không tìm thấy sản phẩm nào</div>
                  ) : (
                    <>
                      {(() => {
                        const cats = [...new Set(suggestions.map(p => p.category).filter(Boolean))];
                        if (!cats.length) return null;
                        return (
                          <div className="search-trending">
                            <p className="search-trending-title">🔥 TÌM KIẾM NHIỀU NHẤT</p>
                            <div className="search-trending-tags">
                              {cats.map(cat => (
                                <span
                                  key={cat}
                                  className="search-trending-tag"
                                  onMouseDown={() => {
                                    setShowDrop(false);
                                    setSearchVal(cat);
                                    navigate(`/?search=${encodeURIComponent(cat)}`);
                                  }}
                                >{cat}</span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {suggestions.map(p => (
                        <div
                          key={p._id}
                          className="search-drop-item"
                          onMouseDown={() => handleSelectSuggestion(p)}
                        >
                          <img
                            src={p.image || 'https://placehold.co/44x44'}
                            alt={p.name}
                            className="search-drop-img"
                            onError={e => { e.target.src = 'https://placehold.co/44x44'; }}
                          />
                          <div className="search-drop-info">
                            <p className="search-drop-name">{p.name}</p>
                            <p className="search-drop-cat">{p.category}</p>
                          </div>
                          <span className="search-drop-price">{formatPrice(p.price)}</span>
                        </div>
                      ))}

                      <div className="search-drop-all" onMouseDown={handleSearch}>
                        🔍 Xem tất cả kết quả cho "<strong>{searchVal}</strong>"
                      </div>
                    </>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
