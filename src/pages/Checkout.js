import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    payment: 'Cash on Delivery'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const orderData = {
        ...formData,
        items: cartItems.map(item => `${item.name}(${item.quantity})`).join(' '),
        custname: user.name,
        contactno: user.contactno || '',
        email: user.email,
        gender: user.gender || 'Not specified',
        payment: `Rs.${getTotalPrice()}/-`,
        status: 'pending'
      };

      console.log('Placing order with data:', orderData);
      const response = await api.createOrder(orderData);
      console.log('Order response:', response);
      
      if (response.success) {
        await clearCart();
        setMessage('Order placed successfully! You will receive a confirmation email soon.');
      } else {
        setMessage('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setMessage(`Failed to place order: ${error.response?.data?.error || error.message}`);
    }
    
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="checkout-page">
        <div className="container">
          <h1>Please login to checkout</h1>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <h1>Your cart is empty</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item._id} className="order-item">
                  <img src={`/admin/uploaded_img/${item.image}`} alt={item.name} />
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: Rs.{item.price * item.quantity}/-</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="total">
              <h3>Total: Rs.{getTotalPrice()}/-</h3>
            </div>
          </div>
          
          <div className="checkout-form">
            <h2>Shipping Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="address">Address:</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="city">City:</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State:</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="pincode">Pincode:</label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="payment">Payment Method:</label>
                <select
                  id="payment"
                  name="payment"
                  value={formData.payment}
                  onChange={handleChange}
                >
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Online Payment">Online Payment</option>
                </select>
              </div>

              {message && (
                <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

