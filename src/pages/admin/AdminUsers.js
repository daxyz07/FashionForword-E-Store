import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../config/api';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [showAddAdminForm, setShowAddAdminForm] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === 'users') {
        const response = await api.getAdminUsers();
        setUsers(Array.isArray(response) ? response : []);
      } else {
        const response = await api.getAdminAdmins();
        setAdmins(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (activeTab === 'users') {
        setUsers([]);
      } else {
        setAdmins([]);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(userId);
        alert('User deleted successfully!');
        fetchData();
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await api.deleteAdmin(adminId);
        alert('Admin deleted successfully!');
        fetchData();
      } catch (error) {
        alert('Failed to delete admin');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="admin-users">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="admin-header">
        <div className="admin-nav">
          <div className="admin-logo">
            <h1>Fashion Forward</h1>
            <h1>User Management</h1>
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

      <div className="users-content">
        <div className="users-header">
          <h2>Manage Users & Admins</h2>
          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users ({users.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'admins' ? 'active' : ''}`}
              onClick={() => setActiveTab('admins')}
            >
              Admins ({admins.length})
            </button>
          </div>
        </div>

        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <h3>Registered Users</h3>
              <p>Manage customer accounts and information</p>
            </div>
            
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Gender</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="user-name">{user.name}</td>
                      <td className="user-email">{user.email}</td>
                      <td className="user-contact">{user.contactno}</td>
                      <td className="user-gender">{user.gender}</td>
                      <td className="user-date">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteUser(user._id)}
                          title="Delete User"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="admins-section">
            <div className="section-header">
              <h3>Admin Accounts</h3>
              <p>Manage admin accounts and permissions</p>
              <button 
                className="btn-primary"
                onClick={() => setShowAddAdminForm(true)}
              >
                Add New Admin
              </button>
            </div>
            
            <div className="admins-table-container">
              <table className="admins-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin._id}>
                      <td className="admin-name">{admin.name}</td>
                      <td className="admin-email">{admin.email}</td>
                      <td className="admin-contact">{admin.contactno}</td>
                      <td className="admin-role">
                        <span className="role-badge">Admin</span>
                      </td>
                      <td className="admin-date">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteAdmin(admin._id)}
                          title="Delete Admin"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(activeTab === 'users' && users.length === 0) && (
          <div className="no-data">
            <div className="no-data-icon">
              <i className="bi bi-people"></i>
            </div>
            <h3>No users found</h3>
            <p>No users have registered yet</p>
          </div>
        )}

        {(activeTab === 'admins' && admins.length === 0) && (
          <div className="no-data">
            <div className="no-data-icon">
              <i className="bi bi-person-gear"></i>
            </div>
            <h3>No admins found</h3>
            <p>Add some admin accounts to get started</p>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddAdminForm && (
        <AddAdminForm 
          onClose={() => setShowAddAdminForm(false)}
          onSave={() => {
            setShowAddAdminForm(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

// Add Admin Form Component
const AddAdminForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contactno: '',
    gender: 'Male'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.addAdmin(formData);
      alert('Admin added successfully!');
      onSave();
    } catch (error) {
      alert('Failed to add admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add New Admin</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="name">Full Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactno">Contact Number:</label>
            <input
              type="tel"
              id="contactno"
              name="contactno"
              value={formData.contactno}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender:</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUsers;
