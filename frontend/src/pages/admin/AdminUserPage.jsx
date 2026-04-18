// src/pages/admin/AdminUserPage.jsx — Quản lý user cho admin

import { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import AdminLayout from "./AdminLayout";
import "./AdminUserPage.css";

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editRole, setEditRole] = useState("");

  const limit = 10;

  // Lấy danh sách users
  const fetchUsers = async (searchQuery = "", pageNum = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/users", {
        params: {
          search: searchQuery,
          page: pageNum,
          limit,
        },
      });

      if (res.data.success) {
        setUsers(res.data.data.users);
        setPagination(res.data.data.pagination);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách users:", error);
      alert("Lỗi lấy danh sách users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(search, page);
  }, [page]);

  // Tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(search, 1);
  };

  // Xem chi tiết user
  const handleViewDetail = async (userId) => {
    try {
      const res = await api.get(`/users/${userId}`);
      if (res.data.success) {
        setSelectedUser(res.data.data.user);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết user:", error);
      alert("Lỗi lấy chi tiết user");
    }
  };

  // Cập nhật trạng thái user (khóa/mở khóa)
  const handleToggleStatus = async (userId, currentStatus) => {
    if (
      !window.confirm(
        `Bạn muốn ${currentStatus ? "khóa" : "mở khóa"} tài khoản này?`,
      )
    ) {
      return;
    }

    try {
      const res = await api.put(`/users/${userId}/status`, {
        isActive: !currentStatus,
      });

      if (res.data.success) {
        alert(res.data.message);
        fetchUsers(search, page);
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert("Lỗi cập nhật trạng thái");
    }
  };

  // Bắt đầu edit role
  const handleStartEditRole = (user) => {
    setEditingUserId(user._id);
    setEditRole(user.role);
  };

  // Lưu thay đổi role
  const handleSaveRole = async (userId) => {
    if (editRole === users.find((u) => u._id === userId)?.role) {
      setEditingUserId(null);
      return;
    }

    if (!window.confirm(`Bạn muốn thay đổi role sang "${editRole}"?`)) {
      return;
    }

    try {
      const res = await api.put(`/users/${userId}/role`, {
        role: editRole,
      });

      if (res.data.success) {
        alert(res.data.message);
        fetchUsers(search, page);
        setEditingUserId(null);
      }
    } catch (error) {
      console.error("Lỗi cập nhật role:", error);
      alert("Lỗi cập nhật role");
    }
  };

  return (
    <AdminLayout pageTitle="⚙️ Quản lý tài khoản người dùng">
      <div className="admin-user-page">

      {/* Form tìm kiếm */}
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="btn-search">
          🔍 Tìm kiếm
        </button>
      </form>

      {/* Bảng danh sách users */}
      {loading ? (
        <p className="loading">Đang tải...</p>
      ) : users.length === 0 ? (
        <p className="no-data">Không tìm thấy user nào</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className={!user.isActive ? "locked" : ""}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {editingUserId === user._id ? (
                        <div className="edit-role">
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="role-select"
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                          <button
                            onClick={() => handleSaveRole(user._id)}
                            className="btn-save"
                          >
                            ✓ Lưu
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="btn-cancel"
                          >
                            ✕ Hủy
                          </button>
                        </div>
                      ) : (
                        <div className="role-display">
                          <span className={`role-badge role-${user.role}`}>
                            {user.role}
                          </span>
                          <button
                            onClick={() => handleStartEditRole(user)}
                            className="btn-edit-role"
                            title="Sửa role"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${user.isActive ? "active" : "locked"}`}
                      >
                        {user.isActive ? "✓ Hoạt động" : "✕ Bị khóa"}
                      </span>
                    </td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="actions">
                      <button
                        onClick={() => handleViewDetail(user._id)}
                        className="btn-detail"
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() =>
                          handleToggleStatus(user._id, user.isActive)
                        }
                        className={`btn-toggle ${user.isActive ? "btn-lock" : "btn-unlock"}`}
                        title={
                          user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"
                        }
                      >
                        {user.isActive ? "🔒" : "🔓"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-page"
              >
                ← Trước
              </button>
              <span className="page-info">
                Trang {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
                className="btn-page"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal xem chi tiết */}
      {showDetailModal && selectedUser && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết user</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="btn-close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>Tên:</strong>
                <span>{selectedUser.name}</span>
              </div>
              <div className="detail-row">
                <strong>Email:</strong>
                <span>{selectedUser.email}</span>
              </div>
              <div className="detail-row">
                <strong>Role:</strong>
                <span className={`role-badge role-${selectedUser.role}`}>
                  {selectedUser.role}
                </span>
              </div>
              <div className="detail-row">
                <strong>Trạng thái:</strong>
                <span
                  className={`status-badge ${selectedUser.isActive ? "active" : "locked"}`}
                >
                  {selectedUser.isActive ? "✓ Hoạt động" : "✕ Bị khóa"}
                </span>
              </div>
              <div className="detail-row">
                <strong>Ngày tạo:</strong>
                <span>
                  {new Date(selectedUser.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() =>
                  handleToggleStatus(selectedUser._id, selectedUser.isActive)
                }
                className={`btn-modal ${selectedUser.isActive ? "btn-lock" : "btn-unlock"}`}
              >
                {selectedUser.isActive
                  ? "🔒 Khóa tài khoản"
                  : "🔓 Mở khóa tài khoản"}
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="btn-modal btn-close"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
