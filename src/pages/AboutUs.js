import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-page">
      <div className="container">
        <h1>About <span className="colored-word">FashionForward</span></h1>
        
        <div className="about-content">
          <div className="about-text">
            <h2>Welcome to FashionForward🦋</h2>
            <p>
              FashionForward is your premier destination for trendy and affordable fashion. 
              We believe that everyone deserves to look and feel their best, which is why 
              we offer a carefully curated collection of clothing for men, women, and kids.
            </p>
            
            <h3>Our Mission</h3>
            <p>
              To provide high-quality, fashionable clothing that empowers our customers 
              to express their unique style while maintaining affordability and accessibility.
            </p>
            
            <h3>What We Offer</h3>
            <ul>
              <li>Men's Fashion - From casual wear to formal attire</li>
              <li>Women's Fashion - Trendy kurtas, tops, and sarees</li>
              <li>Kids' Fashion - Adorable outfits for every occasion</li>
              <li>100% Original Products Guarantee</li>
              <li>30-day Return Policy</li>
              <li>Free Delivery on orders above Rs.999</li>
            </ul>
            
            <h3>Why Choose FashionForward?</h3>
            <p>
              We understand the importance of looking good while staying within budget. 
              Our team carefully selects each product to ensure quality, style, and value 
              for money. With our easy-to-use platform and excellent customer service, 
              shopping for fashion has never been this convenient.
            </p>
          </div>
          
          <div className="about-image">
            <img src="/images/mainlogo.png" alt="FashionForward Logo" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

