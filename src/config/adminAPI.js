// Admin API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class AdminAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Authentication
  async adminLogin(email, password) {
    return this.request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  // Dashboard Stats
  async getAdminStats() {
    return this.request('/api/admin/stats');
  }

  // Products Management
  async getAdminProducts(category) {
    return this.request(`/api/admin/products/${category}`);
  }

  async addProduct(productData, category) {
    const formData = new FormData();
    formData.append('name', productData.p_name);
    formData.append('price', productData.p_price);
    formData.append('description', productData.p_description);
    formData.append('category', category);
    if (productData.p_image) {
      formData.append('image', productData.p_image);
    }

    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${this.baseURL}/api/admin/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to add product');
    }
    return data;
  }

  async updateProduct(productId, productData, category) {
    const formData = new FormData();
    formData.append('name', productData.p_name);
    formData.append('price', productData.p_price);
    formData.append('description', productData.p_description);
    formData.append('category', category);
    if (productData.p_image) {
      formData.append('image', productData.p_image);
    }

    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${this.baseURL}/api/admin/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update product');
    }
    return data;
  }

  async deleteProduct(productId, category) {
    return this.request(`/api/admin/products/${productId}?category=${category}`, {
      method: 'DELETE'
    });
  }

  // Orders Management
  async getAdminOrders(filter = 'all') {
    return this.request(`/api/admin/orders?filter=${filter}`);
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async getOrderDetails(orderId) {
    return this.request(`/api/admin/orders/${orderId}`);
  }

  // Users Management
  async getAdminUsers() {
    return this.request('/api/admin/users');
  }

  async getAdminAdmins() {
    return this.request('/api/admin/admins');
  }

  async addAdmin(adminData) {
    return this.request('/api/admin/admins', {
      method: 'POST',
      body: JSON.stringify(adminData)
    });
  }

  async deleteUser(userId) {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }

  async deleteAdmin(adminId) {
    return this.request(`/api/admin/admins/${adminId}`, {
      method: 'DELETE'
    });
  }

  // Analytics
  async getAnalytics() {
    return this.request('/api/admin/analytics');
  }

  // Contact Messages
  async getContactMessages() {
    return this.request('/api/admin/contact');
  }

  async deleteContactMessage(messageId) {
    return this.request(`/api/admin/contact/${messageId}`, {
      method: 'DELETE'
    });
  }
}

export const adminAPI = new AdminAPI();
