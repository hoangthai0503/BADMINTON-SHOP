import { Link } from 'react-router-dom';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const formatSold = (soldStr) => {
  const sold = Number(soldStr) || 0;
  if (sold < 1000) return sold.toString();
  const mathK = Math.floor(sold / 1000);
  const remainder = Math.floor((sold % 1000) / 100);
  if (remainder === 0) return `${mathK}k`;
  return `${mathK}k${remainder}`;
};

const ProductCard = ({ product }) => {
  // hasDiscount: có giá gốc VÀ giá gốc > giá bán → đang khuyến mãi
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      {/* Badge % OFF — chỉ hiện khi có giảm giá */}
      {hasDiscount && (
        <span className="product-card-badge">-{discountPct}%</span>
      )}
      <img
        src={product.image || 'https://placehold.co/400x200?text=No+Image'}
        alt={product.name}
        onError={e => { e.target.src = 'https://placehold.co/400x200?text=No+Image'; }}
      />
      <div className="product-card-body">
        <p className="product-card-name">{product.name}</p>
        <p className="product-card-cat">{product.category}</p>
        <div className="product-card-price-wrap" style={{ marginTop: 'auto' }}>
          {hasDiscount ? (
            <>
              {/* Có giảm giá: giá gốc gạch ngang (nhỏ) + giá giảm chữ to */}
              <p className="product-card-original">{formatPrice(product.originalPrice)}</p>
              <p className="product-card-price">{formatPrice(product.price)}</p>
            </>
          ) : (
            <>
              {/* Không giảm giá: tạo 1 dòng trống để đồng bộ chiều cao */}
              <p className="product-card-original" style={{ visibility: 'hidden' }}>{formatPrice(product.price)}</p>
              <p className="product-card-price">{formatPrice(product.price)}</p>
            </>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <p className="product-card-stock">Còn {product.stock} sp</p>
          <p className="product-card-sold" style={{ fontSize: '13px', color: '#64748b' }}>Đã bán: {formatSold(product.sold || 0)}</p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
