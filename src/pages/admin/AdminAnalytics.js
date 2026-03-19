import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../config/api';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    monthlyRevenue: [],
    topProducts: [],
    orderStatusDistribution: {},
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.getAnalytics();
      setAnalytics(response);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="admin-analytics">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      <div className="admin-header">
        <div className="admin-nav">
          <div className="admin-logo">
            <h1>Fashion Forward</h1>
            <h1>Analytics Dashboard</h1>
          </div>
          <div className="admin-actions">
            <button className="btn-secondary" onClick={() => navigate('/admin/dashboard')}>
              Dashboard
            </button>
            <button className="btn-secondary" onClick={() => navigate('/admin/products')}>
              Products
            </button>
            <button className="btn-secondary" onClick={() => navigate('/admin/orders')}>
              Orders
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="analytics-content">
        <div className="analytics-header">
          <h2>Business Analytics</h2>
          <div className="time-range-selector">
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="metrics-grid">
          <div className="metric-card revenue">
            <div className="metric-icon">
              <i className="bi bi-currency-rupee"></i>
            </div>
            <div className="metric-content">
              <h3>{formatCurrency(analytics.totalRevenue)}</h3>
              <p>Total Revenue</p>
              <span className="metric-change positive">+12.5%</span>
            </div>
          </div>

          <div className="metric-card orders">
            <div className="metric-icon">
              <i className="bi bi-cart-check"></i>
            </div>
            <div className="metric-content">
              <h3>{analytics.totalOrders}</h3>
              <p>Total Orders</p>
              <span className="metric-change positive">+8.2%</span>
            </div>
          </div>

          <div className="metric-card users">
            <div className="metric-icon">
              <i className="bi bi-people"></i>
            </div>
            <div className="metric-content">
              <h3>{analytics.totalUsers}</h3>
              <p>Total Users</p>
              <span className="metric-change positive">+15.3%</span>
            </div>
          </div>

          <div className="metric-card products">
            <div className="metric-icon">
              <i className="bi bi-box"></i>
            </div>
            <div className="metric-content">
              <h3>{analytics.totalProducts}</h3>
              <p>Total Products</p>
              <span className="metric-change positive">+5.7%</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <h3>Revenue Trend</h3>
            <div className="chart-placeholder">
              <i className="bi bi-graph-up"></i>
              <p>Revenue chart would be displayed here</p>
              <small>Integration with Chart.js or similar library needed</small>
            </div>
          </div>

          <div className="chart-container">
            <h3>Order Status Distribution</h3>
            <div className="status-distribution">
              {Object.entries(analytics.orderStatusDistribution).map(([status, count]) => (
                <div key={status} className="status-item">
                  <div className="status-info">
                    <span className="status-name">{status}</span>
                    <span className="status-count">{count}</span>
                  </div>
                  <div className="status-bar">
                    <div 
                      className="status-fill" 
                      style={{ 
                        width: `${(count / analytics.totalOrders) * 100}%`,
                        backgroundColor: getStatusColor(status)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="top-products-section">
          <h3>Top Selling Products</h3>
          <div className="products-list">
            {analytics.topProducts.map((product, index) => (
              <div key={product._id} className="product-item">
                <div className="product-rank">#{index + 1}</div>
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>{product.category}</p>
                </div>
                <div className="product-stats">
                  <span className="sales-count">{product.sales} sales</span>
                  <span className="revenue">{formatCurrency(product.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="recent-orders-section">
          <h3>Recent Orders</h3>
          <div className="orders-list">
            {analytics.recentOrders.map((order) => (
              <div key={order._id} className="order-item">
                <div className="order-info">
                  <h4>Order #{order._id.slice(-8)}</h4>
                  <p>{order.custname} • {order.items}</p>
                </div>
                <div className="order-details">
                  <span className="order-amount">{order.payment}</span>
                  <span className={`order-status ${order.status}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    pending: '#ffc107',
    approved: '#28a745',
    shipped: '#17a2b8',
    delivered: '#6f42c1',
    cancelled: '#dc3545'
  };
  return colors[status] || '#6c757d';
};

export default AdminAnalytics;
