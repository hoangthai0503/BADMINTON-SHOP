// App.jsx — Định nghĩa toàn bộ routes của ứng dụng

import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import LoginModal from "./components/LoginModal";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import ProfilePage from "./pages/ProfilePage";
import ServicesPage from "./pages/ServicesPage";
import NewsPage from "./pages/NewsPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import AdminProductPage from "./pages/admin/AdminProductPage";
import AdminCategoryPage from "./pages/admin/AdminCategoryPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUserPage from "./pages/admin/AdminUserPage";
import AdminBannerPage from "./pages/admin/AdminBannerPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminNewsPage from "./pages/admin/AdminNewsPage";
import AdminCouponPage from "./pages/admin/AdminCouponPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import OrderDetailPage from "./pages/OrderDetailPage";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <LoginModal />
        <Routes>
          {/* ── Trang người dùng: có Navbar + Footer ── */}
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <main className="page-wrapper">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductListPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/news/:id" element={<NewsDetailPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route
                      path="/products/:id"
                      element={<ProductDetailPage />}
                    />
                    <Route
                      path="/cart"
                      element={
                        <PrivateRoute>
                          <CartPage />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/checkout"
                      element={
                        <PrivateRoute>
                          <CheckoutPage />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <PrivateRoute>
                          <OrderHistoryPage />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/orders/:id"
                      element={
                        <PrivateRoute>
                          <OrderDetailPage />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <PrivateRoute>
                          <ProfilePage />
                        </PrivateRoute>
                      }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />

          {/* ── Trang admin: layout riêng, không có Navbar/Footer ── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <PrivateRoute adminOnly>
                <AdminProductPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <PrivateRoute adminOnly>
                <AdminCategoryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <PrivateRoute adminOnly>
                <AdminOrders />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/banners"
            element={
              <PrivateRoute adminOnly>
                <AdminBannerPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/news"
            element={
              <PrivateRoute adminOnly>
                <AdminNewsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <PrivateRoute adminOnly>
                <AdminCouponPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute adminOnly>
                <AdminUserPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
