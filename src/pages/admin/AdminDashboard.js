import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../config/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    menProducts: 0,
    womenProducts: 0,
    kidsProducts: 0,
    totalUsers: 0,
    totalAdmins: 0,
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    todayOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.getAdminStats();
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-nav">
          <div className="admin-logo">
            <h1>Fashion Forward</h1>
            <h1>Admin Panel</h1>
          </div>
          <div className="admin-actions">
            <button className="btn-secondary" onClick={() => navigate('/admin/products')}>
              Manage Products
            </button>
            <button className="btn-secondary" onClick={() => navigate('/admin/orders')}>
              Manage Orders
            </button>
            <button className="btn-secondary" onClick={() => navigate('/admin/users')}>
              Manage Users
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Dashboard Overview</h2>
          <p>Welcome to FashionForward Admin Panel</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card" onClick={() => navigate('/admin/products')}>
            <div className="stat-icon men">
              <i className="bi bi-person"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.menProducts}</h3>
              <p>Men's Products</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/admin/products')}>
            <div className="stat-icon women">
              <i className="bi bi-person-dress"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.womenProducts}</h3>
              <p>Women's Products</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/admin/products')}>
            <div className="stat-icon kids">
              <i className="bi bi-people"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.kidsProducts}</h3>
              <p>Kids' Products</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/admin/users')}>
            <div className="stat-icon users">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/admin/users')}>
            <div className="stat-icon admins">
              <i className="bi bi-person-gear"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalAdmins}</h3>
              <p>Total Admins</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/admin/orders')}>
            <div className="stat-icon orders">
              <i className="bi bi-cart-check"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/admin/orders?status=pending')}>
            <div className="stat-icon pending">
              <i className="bi bi-clock"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.pendingOrders}</h3>
              <p>Pending Orders</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/admin/orders?status=approved')}>
            <div className="stat-icon approved">
              <i className="bi bi-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.approvedOrders}</h3>
              <p>Approved Orders</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/admin/orders?filter=today')}>
            <div className="stat-icon today">
              <i className="bi bi-calendar-day"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.todayOrders}</h3>
              <p>Today's Orders</p>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => navigate('/admin/products/add')}>
              <i className="bi bi-plus-circle"></i>
              Add New Product
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/orders')}>
              <i className="bi bi-list-check"></i>
              View All Orders
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/users')}>
              <i className="bi bi-person-plus"></i>
              Add New Admin
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/analytics')}>
              <i className="bi bi-graph-up"></i>
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
