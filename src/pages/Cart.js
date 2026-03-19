import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    const result = await updateQuantity(cartItemId, newQuantity);
    if (!result.success) {
      alert(result.message);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    if (window.confirm('Remove item from cart?')) {
      const result = await removeFromCart(cartItemId);
      if (!result.success) {
        alert(result.message);
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to delete all items?')) {
      const result = await clearCart();
      if (!result.success) {
        alert(result.message);
      }
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    navigate('/checkout');
  };

  if (!user) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>Please login to view your cart</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <section className="shopping-cart">
          <h1 className="heading">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <h2>Your cart is empty</h2>
              <p>Add some products to get started!</p>
            </div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total Price</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <img 
                          src={`/admin/uploaded_img/${item.image}`} 
                          height="120" 
                          width="100" 
                          alt={item.name} 
                        />
                      </td>
                      <td>{item.name}</td>
                      <td>Rs.{item.price}/-</td>
                      <td>
                        <select 
                          value={item.quantity} 
                          onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value))}
                        >
                          {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </td>
                      <td>Rs.{item.price * item.quantity}/-</td>
                      <td>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleRemoveItem(item._id)}
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  <tr className="table-bottom">
                    <td>
                      <a href="/products" style={{marginTop: 0}}>
                        <i className="bi bi-bag"></i>
                      </a>
                    </td>
                    <td colSpan="3">Grand Total</td>
                    <td>Rs.{getTotalPrice()}/-</td>
                    <td>
                      <button 
                        className="delete-btn" 
                        onClick={handleClearCart}
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="checkout-btn">
                <button 
                  className={`btn ${cartItems.length > 0 ? '' : 'disabled'}`}
                  onClick={handleCheckout}
                >
                  PLACE ORDER
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Cart;

