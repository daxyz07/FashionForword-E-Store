import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Home.css';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const { cartItems } = useCart();
  
  const slides = [
    { 
      title: 'New Collection 2024',
      subtitle: 'Discover the latest trends in fashion',
      description: 'From casual wear to formal attire, find your perfect style',
      cta: 'Explore Collection',
      bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: '✨'
    },
    { 
      title: 'Summer Sale',
      subtitle: 'Up to 50% off on selected items',
      description: 'Limited time offer on premium fashion items',
      cta: 'Shop Deals',
      bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      icon: '🔥'
    },
    { 
      title: 'Premium Quality',
      subtitle: 'Handpicked fashion for every occasion',
      description: 'Quality materials and craftsmanship you can trust',
      cta: 'View Quality',
      bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      icon: '💎'
    }
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'Classic White Shirt',
      price: 1299,
      originalPrice: 1599,
      image: '/admin/uploaded_img/shirt1.png',
      category: 'men',
      badge: 'Best Seller'
    },
    {
      id: 2,
      name: 'Elegant Black Dress',
      price: 2499,
      originalPrice: 2999,
      image: '/admin/uploaded_img/merlin-6.jpg',
      category: 'women',
      badge: 'New'
    },
    {
      id: 3,
      name: 'Kids Colorful T-Shirt',
      price: 599,
      originalPrice: 799,
      image: '/admin/uploaded_img/kid1.jpg',
      category: 'kids',
      badge: 'Sale' 
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Fashion Blogger',
      content: 'FashionForward has the best collection! The quality is amazing and delivery is super fast.',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      name: 'Mike Chen',
      role: 'Customer',
      content: 'Great prices and excellent customer service. I always find what I\'m looking for here.',
      rating: 5,
      avatar: '👨‍💻'
    },
    {
      name: 'Emma Davis',
      role: 'Stylist',
      content: 'The variety and quality of products is outstanding. My clients love the pieces I recommend.',
      rating: 5,
      avatar: '👩‍🎨'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // const nextSlide = () => {
  //   setCurrentSlide((prev) => (prev + 1) % slides.length);
  // };

  // const prevSlide = () => {
  //   setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  // };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className={`hero-text ${isVisible ? 'fade-in' : ''}`}>
            <h1 className="hero-title">
              Welcome to <span className="brand-name">FashionForward</span>
            </h1>
            <p className="hero-subtitle">
              {user ? `Welcome back, ${user.name}!` : 'Discover the latest trends in fashion'}
            </p>
            <p className="hero-description">
              Your one-stop destination for premium fashion. From casual wear to formal attire, 
              we have everything you need to express your unique style.
            </p>
            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary">
                <span>🛍️</span> Shop Now
              </Link>
              {!user && (
                <Link to="/login" className="btn btn-secondary">
                  <span>👤</span> Sign In
                </Link>
              )}
              {user && cartItems.length > 0 && (
                <Link to="/cart" className="btn btn-cart">
                  <span>🛒</span> View Cart ({cartItems.length})
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Animated Slideshow */}
      {/* <div className="slideshow-section">
        <div className="container">
          <h2 className="section-title">Featured Collections</h2>
          <div className="slideshow-container">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`slide ${index === currentSlide ? 'active' : ''}`}
                style={{ background: slide.bgColor }}
              >
                <div className="slide-content">
                  <div className="slide-icon">{slide.icon}</div>
                  <h3 className="slide-title">{slide.title}</h3>
                  <p className="slide-subtitle">{slide.subtitle}</p>
                  <p className="slide-description">{slide.description}</p>
                  <Link to="/products" className="slide-cta">
                    {slide.cta}
                  </Link>
                </div>
              </div>
            ))}
            <div className="slide-indicators">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div> */}

      {/* Category Section */}
      <div className="category-section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            <Link to="/men" className="category-card">
              <div className="category-item men-category">
                <div className="category-icon">👔</div>
                <h3>Men's Fashion</h3>
                <p>Stylish & Comfortable</p>
                <div className="category-stats">
                  <span>50+ Items</span>
                  <span>From ₹599</span>
                </div>
                <span className="category-arrow">→</span>
              </div>
            </Link>
            
            <Link to="/women" className="category-card">
              <div className="category-item women-category">
                <div className="category-icon">👗</div>
                <h3>Women's Fashion</h3>
                <p>Elegant & Trendy</p>
                <div className="category-stats">
                  <span>75+ Items</span>
                  <span>From ₹799</span>
                </div>
                <span className="category-arrow">→</span>
              </div>
            </Link>
            
            <Link to="/kids" className="category-card">
              <div className="category-item kids-category">
                <div className="category-icon">👶</div>
                <h3>Kids Fashion</h3>
                <p>Fun & Colorful</p>
                <div className="category-stats">
                  <span>30+ Items</span>
                  <span>From ₹399</span>
                </div>
                <span className="category-arrow">→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="featured-products-section">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-badge">{product.badge}</div>
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <div className="product-pricing">
                    <span className="current-price">₹{product.price}</span>
                    <span className="original-price">₹{product.originalPrice}</span>
                    <span className="discount">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                  <Link to={`/product/${product.id}`} className="product-link">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose FashionForward?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Free Shipping</h3>
              <p>Free delivery on orders above ₹999</p>
              <span className="feature-highlight">No hidden charges</span>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💎</div>
              <h3>Premium Quality</h3>
              <p>Handpicked items for the best quality</p>
              <span className="feature-highlight">100% authentic</span>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Easy Returns</h3>
              <p>30-day return policy for your peace of mind</p>
              <span className="feature-highlight">Hassle-free</span>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Secure Payment</h3>
              <p>Safe and secure payment options</p>
              <span className="feature-highlight">SSL encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="testimonials-section">
        <div className="container">
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar}</div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Stay Updated with Latest Trends</h2>
            <p>Subscribe to our newsletter and get 10% off your first order!</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email address" />
              <button className="btn btn-primary">Subscribe</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

