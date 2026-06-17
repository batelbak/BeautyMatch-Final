import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} AI Beauty. All rights reserved.</p>
        <p className="slogan">AI Beauty - Your beauty, redefined by intelligence.</p>
      </div>
    </footer>
  );
};

export default Footer;