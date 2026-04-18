const Footer = () => (
  <footer className="site-footer">
    <p className="footer-brand">🛒 E-Shop</p>
    <div className="footer-links">
      <a href="/">Sản phẩm</a>
      <a href="/cart">Giỏ hàng</a>
      <a href="/orders">Đơn hàng</a>
      <a href="/login">Đăng nhập</a>
      <a href="/register">Đăng ký</a>
    </div>
    <p className="footer-copy">© {new Date().getFullYear()} E-Shop. Đồ án môn học.</p>
  </footer>
);

export default Footer;
