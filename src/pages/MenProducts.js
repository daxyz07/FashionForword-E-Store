import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../config/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductListing.css';

const MenProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [filterPrice, setFilterPrice] = useState('all');
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.getAdminProducts('men');
      if (response.products) {
        setProducts(response.products);
      } else {
        setProducts(response);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    const result = await addToCart(product._id, 1);
    if (result.success) {
      alert('Product added to cart successfully!');
    } else {
      alert(result.message);
    }
  };

  const sortProducts = (products) => {
    const sorted = [...products];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.p_price - b.p_price);
      case 'price-high':
        return sorted.sort((a, b) => b.p_price - a.p_price);
      case 'name':
      default:
        return sorted.sort((a, b) => a.p_name.localeCompare(b.p_name));
    }
  };

  const filterProducts = (products) => {
    if (filterPrice === 'all') return products;
    
    switch (filterPrice) {
      case 'under-1000':
        return products.filter(p => p.p_price < 1000);
      case '1000-2000':
        return products.filter(p => p.p_price >= 1000 && p.p_price <= 2000);
      case 'above-2000':
        return products.filter(p => p.p_price > 2000);
      default:
        return products;
    }
  };

  const filteredAndSortedProducts = sortProducts(filterProducts(products));

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading men's fashion...</p>
      </div>
    );
  }

  return (
    <div className="product-listing-page">
      {/* Header Section */}
      <div className="page-header">
        <h1>Men<span className="colored-word">'s Fashion</span></h1>
        <p className="page-subtitle">Discover the latest trends in men's clothing</p>
        <hr className="products-hr" />
      </div>

      {/* Filters and Sort */}
      <div className="filters-section">
        <div className="container">
          <div className="filters-row">
            <div className="filter-group">
              <label htmlFor="sort">Sort by:</label>
              <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Name A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="price">Price range:</label>
              <select id="price" value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)}>
                <option value="all">All Prices</option>
                <option value="under-1000">Under ₹1000</option>
                <option value="1000-2000">₹1000 - ₹2000</option>
                <option value="above-2000">Above ₹2000</option>
              </select>
            </div>
            
            <div className="results-count">
              {filteredAndSortedProducts.length} products found
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container">
        <div className="products-container">
          {filteredAndSortedProducts.length > 0 ? (
            filteredAndSortedProducts.map((product) => (
              <div key={product._id} className="product-card">
                <Link to={`/product/${product._id}`} className="product-link">
                  <div className="product-image-container">
                    <img 
                      src={`/admin/uploaded_img/${product.p_image}`} 
                      alt={product.p_name}
                      className="product-image"
                    />
                    <div className="product-overlay">
                      <button 
                        className="quick-add-btn"
                        onClick={(e) => handleAddToCart(e, product)}
                        title="Add to Cart"
                      >
                        🛒
                      </button>
                    </div>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.p_name}</h3>
                    <div className="product-price">₹{product.p_price}</div>
                    <div className="product-description">{product.p_description}</div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="no-products">
              <div className="no-products-icon">👔</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters to see more products</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bottom-cta">
        <Link to='/cart' className="cart-link">
          <div className="cart-cta">
            <span className="cart-icon">🛒</span>
            <span>View Cart</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default MenProducts;

