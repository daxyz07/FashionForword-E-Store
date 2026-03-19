import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../config/api';
import './AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('men');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [resultsCount, setResultsCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminProducts(activeTab);
      
      if (response.products) {
        setProducts(response.products);
        setResultsCount(response.resultsCount || 0);
      } else {
        // Fallback for old API response format
        setProducts(response);
        setResultsCount(response.length);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(productId, activeTab);
        fetchProducts();
        alert('Product deleted successfully!');
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowAddForm(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="admin-products">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-products">
      <div className="admin-header">
        <div className="admin-nav">
          <div className="admin-logo">
            <h1>Fashion Forward</h1>
            <h1>Product Management</h1>
          </div>
          <div className="admin-actions">
            <button className="btn-secondary" onClick={() => navigate('/admin/dashboard')}>
              Dashboard
            </button>
            <button className="btn-secondary" onClick={() => navigate('/admin/orders')}>
              Orders
            </button>
            <button className="btn-secondary" onClick={handleAddNew}>
              Add Product
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="products-content">
        <div className="products-header">
          <h2>Manage Products</h2>
          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'men' ? 'active' : ''}`}
              onClick={() => setActiveTab('men')}
            >
              Men's Products
            </button>
            <button 
              className={`tab-btn ${activeTab === 'women' ? 'active' : ''}`}
              onClick={() => setActiveTab('women')}
            >
              Women's Products
            </button>
            <button 
              className={`tab-btn ${activeTab === 'kids' ? 'active' : ''}`}
              onClick={() => setActiveTab('kids')}
            >
              Kids' Products
            </button>
          </div>
        </div>


        {/* Results Summary */}
        <div className="results-summary">
          <div className="results-info">
            <span className="results-count">
              {resultsCount} product{resultsCount !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>

        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img 
                      src={`/admin/uploaded_img/${product.p_image}`} 
                      alt={product.p_name}
                      className="product-thumb"
                    />
                  </td>
                  <td>{product.p_name}</td>
                  <td>₹{product.p_price}</td>
                  <td className="description-cell">
                    {product.p_description.length > 50 
                      ? `${product.p_description.substring(0, 50)}...` 
                      : product.p_description
                    }
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(product)}
                        title="Edit Product"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(product._id)}
                        title="Delete Product"
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="no-products">
            <div className="no-products-icon">
              <i className="bi bi-box"></i>
            </div>
            <h3>No products found</h3>
            <p>Add some products to get started</p>
            <button className="btn-primary" onClick={handleAddNew}>
              Add First Product
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <ProductForm 
          product={editingProduct}
          category={activeTab}
          onClose={() => setShowAddForm(false)}
          onSave={() => {
            setShowAddForm(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
};

// Product Form Component
const ProductForm = ({ product, category, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    p_name: product?.p_name || '',
    p_price: product?.p_price || '',
    p_description: product?.p_description || '',
    p_image: null
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (product) {
        await api.updateProduct(product._id, formData, category);
        alert('Product updated successfully!');
      } else {
        await api.addProduct(formData, category);
        alert('Product added successfully!');
      }
      onSave();
    } catch (error) {
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="p_name">Product Name:</label>
            <input
              type="text"
              id="p_name"
              name="p_name"
              value={formData.p_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="p_price">Price:</label>
            <input
              type="number"
              id="p_price"
              name="p_price"
              value={formData.p_price}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="p_description">Description:</label>
            <textarea
              id="p_description"
              name="p_description"
              value={formData.p_description}
              onChange={handleChange}
              required
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="p_image">Product Image:</label>
            <input
              type="file"
              id="p_image"
              name="p_image"
              onChange={handleChange}
              accept="image/*"
              required={!product}
            />
            {product && (
              <div className="current-image">
                <img src={`/admin/uploaded_img/${product.p_image}`} alt="Current" />
                <p>Current image</p>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProducts;
