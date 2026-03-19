import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <>
      <div className="footer-container">
        <div className="footer-1">
          <a href="/"><h2>FashionForward🦋</h2></a>
          <br />
          <p><b>ONLINE SHOPPING</b></p>
          <h6>
            Man<br /><br />
            Woman <br /><br />
            Kids <br /><br />
            FashionForward Exclusive<br /><br />
          </h6>
        </div>

        <div className="footer-2">
          <p><b>USEFUL LINKS</b></p>
          <h6>
            <a href="/contact"> Contact Us<br /><br /></a>
            <a href="/about"> About US<br /><br /></a>
          </h6>
        </div>

        <div className="footer-3">
          <p><b>100% Original</b> guarantee</p>
          <h6>
            for all products at fashionfashion.com
          </h6>
          <p><b>Return within 30days</b> of</p>
          <h6>
            receiving you order
          </h6>
          <p><b>Get free delivery</b> for every</p>
          <h6>
            order above Rs.999
          </h6>
        </div>
      </div>
      <p className="copy-right">&copy;2024 FashionForward All Rights Reserved.</p>
    </>
  );
};

export default Footer;

