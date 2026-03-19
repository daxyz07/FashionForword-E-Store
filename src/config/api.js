// API configuration for FashionForward
import axios from 'axios';

// Real API configuration
const API_BASE_URL = 'http://localhost:8000';

// Create axios instance for real API
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Real API service
export const realApi = {
  // Authentication
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  async signup(userData) {
    const response = await apiClient.post('/auth/signup', userData);
    return response.data;
  },

  async verifyToken() {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  },

  // Products
  async getProducts() {
    const response = await apiClient.get('/products');
    return response.data;
  },

  async getMenProducts() {
    const response = await apiClient.get('/products/men');
    return response.data;
  },

  async getWomenProducts() {
    const response = await apiClient.get('/products/women');
    return response.data;
  },

  async getKidsProducts() {
    const response = await apiClient.get('/products/kids');
    return response.data;
  },

  async getProduct(id) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // Cart
  async getCartItems() {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  async addToCart(productId, quantity) {
    const response = await apiClient.post('/cart/add', { productId, quantity });
    return response.data;
  },

  async updateCartItem(cartItemId, quantity) {
    const response = await apiClient.put(`/cart/${cartItemId}`, { quantity });
    return response.data;
  },

  async removeFromCart(cartItemId) {
    const response = await apiClient.delete(`/cart/${cartItemId}`);
    return response.data;
  },

  async clearCart() {
    const response = await apiClient.delete('/cart/clear');
    return response.data;
  },

  // Orders
  async createOrder(orderData) {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  // Contact
  async submitContact(contactData) {
    const response = await apiClient.post('/contact', contactData);
    return response.data;
  },

  // Admin Authentication
  async adminLogin(email, password) {
    try {
      const response = await axios.post('http://localhost:8000/routes/admin.php?action=login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Login failed' };
    }
  },

  // Admin Dashboard Stats
  async getAdminStats() {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get('http://localhost:8000/routes/admin.php?action=stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Admin Products
  async getAdminProducts(category, queryParams = {}) {
    const token = localStorage.getItem('adminToken');
    
    // Build query string
    const params = new URLSearchParams();
    params.append('action', 'products');
    
    if (category) params.append('category', category);
    if (queryParams.searchTerm) params.append('searchTerm', queryParams.searchTerm);
    if (queryParams.minPrice) params.append('minPrice', queryParams.minPrice);
    if (queryParams.maxPrice) params.append('maxPrice', queryParams.maxPrice);
    if (queryParams.dateFrom) params.append('dateFrom', queryParams.dateFrom);
    if (queryParams.dateTo) params.append('dateTo', queryParams.dateTo);
    if (queryParams.sortBy) params.append('sortBy', queryParams.sortBy);
    if (queryParams.sortOrder) params.append('sortOrder', queryParams.sortOrder);
    if (queryParams.page) params.append('page', queryParams.page);
    if (queryParams.limit) params.append('limit', queryParams.limit);
    
    const response = await axios.get(`http://localhost:8000/routes/admin.php?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

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
    const response = await axios.post('http://localhost:8000/routes/admin.php?action=add_product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      },
    });
    return response.data;
  },

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
    const response = await axios.put(`http://localhost:8000/routes/admin.php?action=update_product&id=${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      },
    });
    return response.data;
  },

  async deleteProduct(productId, category) {
    const token = localStorage.getItem('adminToken');
    const response = await axios.delete(`http://localhost:8000/routes/admin.php?action=delete_product&id=${productId}&category=${category}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Admin Orders
  async getAdminOrders(filter = 'all') {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`http://localhost:8000/routes/admin.php?action=orders&filter=${filter}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.orders || [];
  },

  async updateOrderStatus(orderId, status) {
    const token = localStorage.getItem('adminToken');
    const response = await axios.put(`http://localhost:8000/routes/admin.php?action=update_order_status&id=${orderId}`, 
      { status }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async getOrderDetails(orderId) {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`http://localhost:8000/routes/admin.php?action=order_details&id=${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Admin Users
  async getAdminUsers() {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get('http://localhost:8000/routes/admin.php?action=users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.users || [];
  },

  async getAdminAdmins() {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get('http://localhost:8000/routes/admin.php?action=admins', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.admins || [];
  },

  async addAdmin(adminData) {
    const token = localStorage.getItem('adminToken');
    const response = await axios.post('http://localhost:8000/routes/admin.php?action=add_admin', adminData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async deleteUser(userId) {
    const token = localStorage.getItem('adminToken');
    const response = await axios.delete(`http://localhost:8000/routes/admin.php?action=delete_user&id=${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async deleteAdmin(adminId) {
    const token = localStorage.getItem('adminToken');
    const response = await axios.delete(`http://localhost:8000/routes/admin.php?action=delete_admin&id=${adminId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Admin Analytics
  async getAnalytics() {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get('http://localhost:8000/routes/admin.php?action=analytics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Admin Contact Messages
  async getContactMessages() {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get('http://localhost:8000/routes/admin.php?action=contact_messages', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async deleteContactMessage(messageId) {
    const token = localStorage.getItem('adminToken');
    const response = await axios.delete(`http://localhost:8000/routes/admin.php?action=delete_contact_message&id=${messageId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

// Export the API
export const api = realApi;

// Export configuration
export const config = {
  API_BASE_URL
};
