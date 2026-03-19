import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminAnalytics from '../pages/admin/AdminAnalytics';

const AdminRoutes = () => {
  const isAdminAuthenticated = () => {
    return localStorage.getItem('adminToken') !== null;
  };

  const ProtectedRoute = ({ children }) => {
    return isAdminAuthenticated() ? children : <Navigate to="/admin/login" />;
  };

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAdminAuthenticated() ? 
            <Navigate to="/admin/dashboard" /> : 
            <AdminLogin />
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/products" 
        element={
          <ProtectedRoute>
            <AdminProducts />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/products/add" 
        element={
          <ProtectedRoute>
            <AdminProducts />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute>
            <AdminOrders />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders/:id" 
        element={
          <ProtectedRoute>
            <AdminOrders />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/users" 
        element={
          <ProtectedRoute>
            <AdminUsers />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <AdminAnalytics />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/admin/login" />} />
    </Routes>
  );
};

export default AdminRoutes;
