import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../config/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export { CartContext };

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const response = await api.getCartItems();
      setCartItems(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setCartItems([]);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      return { success: false, message: 'Please login to add items to cart' };
    }

    try {
      const response = await api.addToCart(productId, quantity);
      
      if (response.success) {
        await fetchCartItems(); // Refresh cart items
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.message || 'Failed to add to cart' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to add to cart' 
      };
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const response = await api.updateCartItem(cartItemId, quantity);
      
      if (response.success) {
        await fetchCartItems(); // Refresh cart items
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.message || 'Failed to update quantity' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to update quantity' 
      };
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const response = await api.removeFromCart(cartItemId);
      
      if (response.success) {
        await fetchCartItems(); // Refresh cart items
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.message || 'Failed to remove item' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to remove item' 
      };
    }
  };

  const clearCart = async () => {
    try {
      const response = await api.clearCart();
      
      if (response.success) {
        setCartItems([]);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.message || 'Failed to clear cart' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to clear cart' 
      };
    }
  };

  const getTotalPrice = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    fetchCartItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

