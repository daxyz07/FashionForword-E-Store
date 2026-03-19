import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="container">
          <h1>Please login to view your profile</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-container">
          <h1>Your Profile</h1>
          
          <div className="profile-info">
            <div className="profile-field">
              <label>Name:</label>
              <span>{user.name}</span>
            </div>
            
            <div className="profile-field">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            
            <div className="profile-field">
              <label>Contact Number:</label>
              <span>{user.contactno}</span>
            </div>
            
            <div className="profile-field">
              <label>Gender:</label>
              <span>{user.gender}</span>
            </div>
          </div>
          
          <div className="profile-actions">
            <button className="btn-primary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

