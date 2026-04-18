// context/AuthContext.jsx — Global state cho authentication
// React Context giúp share state giữa các component mà không cần truyền props qua nhiều lớp

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

// Tạo Context object
const AuthContext = createContext(null);

// Provider — bọc quanh app để mọi component con đều truy cập được state
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Khởi tạo state từ localStorage để giữ đăng nhập sau khi refresh trang
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
    // JSON.parse vì localStorage chỉ lưu được string
  });
  const [cartCount, setCartCount] = useState(0);

  // Gọi API để đồng bộ số lượng giỏ hàng — dùng useCallback để tránh tạo hàm mới mỗi render
  const refreshCartCount = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/cart');
      const items = res.data.data?.items ?? [];
      // Tổng số lượng tất cả sản phẩm (không phải số loại)
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
    } catch {
      setCartCount(0);
    }
  }, []);

  // Khi refresh trang mà user đã đăng nhập sẵn → load cart count ngay
  useEffect(() => {
    if (token) {
      // Dùng timeout để tránh cảnh báo cascading render khi khởi tạo
      const t = setTimeout(refreshCartCount, 100);
      return () => clearTimeout(t);
    }
  }, [token, refreshCartCount]);

  // Hàm login: lưu vào state VÀ localStorage, sau đó load số giỏ hàng
  const login = (tokenValue, userData) => {
    setToken(tokenValue);
    setUser(userData);
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
    // Delay nhỏ để axiosInstance kịp nhận token mới trước khi gọi API
    setTimeout(refreshCartCount, 50);
  };

  // Hàm logout: xóa tất cả, reset cart count
  const logout = () => {
    setToken(null);
    setUser(null);
    setCartCount(0);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isLoggedIn = !!token;
  const isAdmin = user?.role === 'admin' || 
                  user?.name?.toLowerCase().includes('admin') || 
                  user?.email?.toLowerCase().includes('admin');
  const isUserLoggedIn = isLoggedIn && !isAdmin;
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoggedIn, isUserLoggedIn, isAdmin, cartCount, refreshCartCount, showLoginModal, setShowLoginModal }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — dùng ở mọi component thay vì import useContext + AuthContext
export const useAuth = () => useContext(AuthContext);
