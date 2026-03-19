import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../config/api';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const status = searchParams.get('status');
    const filterParam = searchParams.get('filter');
    
    if (status) {
      setFilter(status);
    } else if (filterParam) {
      setFilter(filterParam);
    }
    
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminOrders(filter);
      setOrders(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      alert(`Order ${newStatus} successfully!`);
      fetchOrders();
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      approved: 'status-approved',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-pending'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="admin-orders">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders">
      <div className="admin-header">
        <div className="admin-nav">
          <div className="admin-logo">
            <h1>Fashion Forward</h1>
            <h1>Order Management</h1>
          </div>
          <div className="admin-actions">
            <button className="btn-secondary" onClick={() => navigate('/admin/dashboard')}>
              Dashboard
            </button>
            <button className="btn-secondary" onClick={() => navigate('/admin/products')}>
              Products
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="orders-content">
        <div className="orders-header">
          <h2>Manage Orders</h2>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Orders
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              Approved
            </button>
            <button 
              className={`filter-btn ${filter === 'shipped' ? 'active' : ''}`}
              onClick={() => setFilter('shipped')}
            >
              Shipped
            </button>
            <button 
              className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
              onClick={() => setFilter('delivered')}
            >
              Delivered
            </button>
            <button 
              className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
              onClick={() => setFilter('today')}
            >
              Today's Orders
            </button>
          </div>
        </div>

        <div className="orders-stats">
          <div className="stat-item">
            <span className="stat-number">{orders.length}</span>
            <span className="stat-label">Total Orders</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {orders.filter(order => order.status === 'pending').length}
            </span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {orders.filter(order => order.status === 'approved').length}
            </span>
            <span className="stat-label">Approved</span>
          </div>
        </div>

        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="order-id">#{order._id.slice(-8)}</td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{order.custname}</div>
                      <div className="customer-contact">{order.contactno}</div>
                      <div className="customer-email">{order.email}</div>
                    </div>
                  </td>
                  <td className="order-items">
                    <div className="items-preview">
                      {order.items}
                    </div>
                  </td>
                  <td className="order-amount">{order.payment}</td>
                  <td>
                    <div className="datetime-info">
                      <div className="order-date">{order.order_date}</div>
                      <div className="order-time">{order.order_time}</div>
                    </div>
                  </td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <div className="order-actions">
                      {order.status === 'pending' && (
                        <>
                          <button 
                            className="btn-approve"
                            onClick={() => handleStatusUpdate(order._id, 'approved')}
                            title="Approve Order"
                          >
                            <i className="bi bi-check-circle"></i>
                          </button>
                          <button 
                            className="btn-cancel"
                            onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                            title="Cancel Order"
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        </>
                      )}
                      {order.status === 'approved' && (
                        <button 
                          className="btn-ship"
                          onClick={() => handleStatusUpdate(order._id, 'shipped')}
                          title="Mark as Shipped"
                        >
                          <i className="bi bi-truck"></i>
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button 
                          className="btn-deliver"
                          onClick={() => handleStatusUpdate(order._id, 'delivered')}
                          title="Mark as Delivered"
                        >
                          <i className="bi bi-check2-circle"></i>
                        </button>
                      )}
                      <button 
                        className="btn-view"
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                        title="View Details"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="no-orders">
            <div className="no-orders-icon">
              <i className="bi bi-cart-x"></i>
            </div>
            <h3>No orders found</h3>
            <p>No orders match your current filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
