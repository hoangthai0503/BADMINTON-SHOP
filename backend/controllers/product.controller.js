// controllers/product.controller.js — CRUD sản phẩm
// GET (public — ai cũng xem được), POST/PUT/DELETE (chỉ admin)

const Product = require('../models/Product');

// ======================== LẤY DANH SÁCH SẢN PHẨM ========================
// GET /api/products?page=1&limit=12&search=áo&minPrice=100&maxPrice=500&sort=price_asc
const getProducts = async (req, res) => {
  try {
    // Đọc query params, đặt giá trị mặc định nếu không có
    const page     = parseInt(req.query.page)  || 1;
    const limit    = parseInt(req.query.limit) || 12;
    const search   = req.query.search   || '';
    const categoriesAttr = req.query.categories ? req.query.categories.split(',') : (req.query.category ? [req.query.category] : []);
    const sort     = req.query.sort     || '';

    const filter = req.query.all === 'true' ? {} : { isActive: true };

    // Lọc theo khoảng giá (chỉ thêm nếu có giá trị)
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
    if (minPrice !== null || maxPrice !== null) {
      filter.price = {};
      if (minPrice !== null) filter.price.$gte = minPrice;
      if (maxPrice !== null) filter.price.$lte = maxPrice;
    }

    // Tìm kiếm theo tên
    if (search) {
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        filter.$or = [{ _id: search }, { name: { $regex: search, $options: 'i' } }];
      } else {
        filter.name = { $regex: search, $options: 'i' };
      }
    }

    // Lọc theo danh mục (chỉ hiệu nghiệm với tab "Tất cả sản phẩm")
    const tab = req.query.tab || 'all';
    if (categoriesAttr.length > 0 && tab === 'all') {
      filter.category = { $in: categoriesAttr.map(c => new RegExp(`^${c}$`, 'i')) };
    }

    // Xử lý tab (Tất cả, Giảm giá, Không giảm giá)
    if (tab === 'discount') {
      filter.$expr = { $gt: ['$originalPrice', '$price'] };
    } else if (tab === 'regular') {
      filter.$or = [
        { originalPrice: null },
        { $expr: { $lte: ['$originalPrice', '$price'] } }
      ];
    } else if (tab === 'new') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filter.createdAt = { $gte: sevenDaysAgo };
    }

    // Xử lý sắp xếp: 1 = tăng dần, -1 = giảm dần
    let sortOption = { createdAt: -1 };  // Mặc định: mới nhất trước
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };

    // Bán chạy: Lượng bán nhiều nhất trong vòng 7 ngày
    if (tab === 'bestseller') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // Tính tổng số bán được cho từng productId trong 7 ngày qua
      const topSellingItems = await require('../models/Order').aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'cancelled' } } },
        { $unwind: "$items" },
        { $group: { _id: "$items.productId", totalSold: { $sum: "$items.quantity" } } },
        { $sort: { totalSold: -1 } }
      ]);

      const skip = (page - 1) * limit;
      const total = topSellingItems.length;
      
      // Cắt mảng để phân trang
      const paginatedItems = topSellingItems.slice(skip, skip + limit);
      const topProductIds = paginatedItems.map(item => item._id);

      // Lấy data từ DB
      const productsData = await Product.find({ ...filter, _id: { $in: topProductIds } });
      
      // Khôi phục lại đúng thứ tự từ biến topProductIds (giảm dần theo totalSold)
      const sortedProducts = topProductIds
        .map(id => productsData.find(p => p._id.toString() === id?.toString()))
        .filter(p => p);

      return res.json({
        success: true,
        data: {
          products: sortedProducts,
          total,
          page,
          totalPages: Math.ceil(total / limit) || 1
        }
      });
    }

    // skip: bỏ qua bao nhiêu document để phân trang
    // Trang 1: skip 0 | Trang 2: skip 12 | Trang 3: skip 24...
    const skip = (page - 1) * limit;

    // Chạy 2 query song song để tối ưu thời gian:
    // 1. Lấy danh sách sản phẩm trang hiện tại
    // 2. Đếm tổng số sản phẩm (để tính tổng số trang)
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limit),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        products,
        total,
        page,
        totalPages: Math.ceil(total / limit)  // Làm tròn lên
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== LẤY 1 SẢN PHẨM THEO ID ========================
// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    // req.params.id là phần ":id" trong URL
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== TẠO SẢN PHẨM MỚI (ADMIN) ========================
// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, image, category, stock, colors, sizes } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      originalPrice,
      image,
      category,
      stock,
      colors,
      sizes
    });

    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== CẬP NHẬT SẢN PHẨM (ADMIN) ========================
// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    // { new: true }: trả về document SAU khi update (mặc định trả document cũ)
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.json({ success: true, message: 'Cập nhật thành công', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== XÓA SẢN PHẨM (ADMIN) — XÓA MỀM ========================
// DELETE /api/products/:id
// Không xóa thật khỏi DB, chỉ đặt isActive = false
// Lý do: Order cũ vẫn tham chiếu đến product, xóa thật sẽ mất dữ liệu
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.json({ success: true, message: 'Đã xóa sản phẩm' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
