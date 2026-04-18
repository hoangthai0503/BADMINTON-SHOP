// components/PrivateRoute.jsx — Bảo vệ các route cần đăng nhập
// Chưa đăng nhập → redirect về /login
// Admin cố vào route user → redirect về /admin
// User cố vào route admin → redirect về /admin/login

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const isAdminAccount = (user) => {
  if (!user) return false;
  return (
    user.role === 'admin' ||
    user.name?.toLowerCase().includes('admin') ||
    user.email?.toLowerCase().includes('admin')
  );
};

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { isLoggedIn, isAdmin, user } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to={adminOnly ? '/admin/login' : '/login'} replace />;
  }

  // Admin cố truy cập route user → đá về admin dashboard
  if (!adminOnly && isAdminAccount(user)) {
    return <Navigate to="/admin" replace />;
  }

  // User thường cố vào route admin → đá về trang login admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default PrivateRoute;
