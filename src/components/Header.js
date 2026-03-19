import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav>
      <div className="logo">
        <Link to="/">
          <img src="/images/rmbgMainlogo.png" alt="FashionForward" />
        </Link>
      </div>

      <ul className="nav-links">
        <li>
          <Link to="/" title="Home">
            <strong>Home</strong>
          </Link>
        </li>

        <li>
          <Link to="/products" title="Shop Now">
            <strong>Shop Now</strong>
          </Link>
        </li>

        {user && (
          <li>
            <Link to="/cart" title="Your Cart">
              <strong>Your Cart ({cartItems.length})</strong>
            </Link>
          </li>
        )}

        <li>
          <Link to="/about" title="About Us">
            <strong>About Us</strong>
          </Link>
        </li>

        <li>
          <Link to="/contact" title="Contact Us">
            <strong>Contact Us</strong>
          </Link>
        </li>

        {user ? (
          <>
            <li>
              <Link to="/profile" title="Your Profile">
                <strong>Your Profile</strong>
              </Link>
            </li>
            <li>
              <Link to="/" onClick={handleLogout} title="Logout">
                <strong>Logout</strong>
              </Link>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login" title="Login">
              <strong>Login</strong>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Header;

