import React from 'react';
import { Link } from 'react-router-dom';
import './Products.css';

const Products = () => {
  return (
    <div className="products-page">
      <h1>Choose <span className="colored-word">Categories</span></h1>
      <center><hr className="products-hr" /></center>
      <br /><br />
      
      <div className="container">
        <div className="products-container">
          <Link to="/men">
            <div className="product">
              <img src="/images/categories-img/male.png" alt="Men's Fashion" />
              <h3>Men's</h3>
            </div>
          </Link>

          <Link to="/women">
            <div className="product">
              <img src="/images/categories-img/female.png" alt="Women's Fashion" />
              <h3>Women's</h3>
            </div>
          </Link>

          <Link to="/kids">
            <div className="product">
              <img src="/images/categories-img/kids.jpg" alt="Kids Fashion" />
              <h3>Kid's</h3>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Products;

