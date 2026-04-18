// api/axiosInstance.js — Axios instance dùng chung cho toàn bộ app
// Tự động thêm baseURL và JWT token vào mọi request, không cần làm thủ công từng chỗ

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api'
  // Khi gọi axiosInstance.get('/products') thực ra gọi http://localhost:5000/api/products
});

// Interceptor: chạy trước mỗi request
// Tự động lấy token từ localStorage và gắn vào header Authorization
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;  // Bắt buộc phải return config để request tiếp tục gửi đi
});

export default axiosInstance;
