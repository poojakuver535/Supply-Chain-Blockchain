import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/api/products');
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="home-page">
      <div className="hero">
        <h1>Blockchain-Based Supply Chain Tracking</h1>
        <p>
          Track products from manufacturer to consumer with complete transparency
          and security using blockchain technology.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/scan-qr" className="btn btn-secondary">
            Scan Product
          </Link>
        </div>
      </div>
      
      <div className="featured-products">
        <h2>Recent Products</h2>
        {products.length === 0 ? (
          <p>No products found</p>
        ) : (
          <div className="product-grid">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      
      <div className="info-sections">
        <div className="info-section">
          <i className="fas fa-shield-alt"></i>
          <h3>Secure & Transparent</h3>
          <p>
            All transactions and product movements are securely recorded on the
            blockchain and cannot be altered.
          </p>
        </div>
        
        <div className="info-section">
          <i className="fas fa-qrcode"></i>
          <h3>Easy Tracking</h3>
          <p>
            Scan QR codes to instantly access a product's complete history and
            verify its authenticity.
          </p>
        </div>
        
        <div className="info-section">
          <i className="fas fa-users"></i>
          <h3>Multi-Party Access</h3>
          <p>
            Manufacturers, distributors, retailers, and consumers all have
            appropriate access to product information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;