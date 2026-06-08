import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const Dashboard = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
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
  }, [isAuthenticated, navigate]);
  
  // Filter products based on user role
  const userProducts = products.filter((product) => {
    if (user.role === 'admin') return true;
    if (user.role === 'manufacturer') {
      return product.manufacturer === user.walletAddress;
    }
    return true; // For distributors and retailers, show all products
  });
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="dashboard">
      <h1 className="large text-primary">Dashboard</h1>
      <p className="lead">
        <i className="fas fa-user"></i> Welcome {user && user.name}
      </p>
      
      {!user?.isAuthorized && (
        <div className="alert alert-warning">
          Your account is pending authorization. You won't be able to create or
          update products until an admin authorizes your account.
        </div>
      )}
      
      <div className="dashboard-actions">
        <Link to="/create-product" className="btn btn-primary">
          <i className="fas fa-plus"></i> Create New Product
        </Link>
        <Link to="/scan-qr" className="btn btn-secondary">
          <i className="fas fa-qrcode"></i> Scan QR Code
        </Link>
      </div>
      
      <div className="dashboard-content">
        <div className="my-products">
          <h2>My Products</h2>
          {userProducts.length === 0 ? (
            <p>You haven't created any products yet</p>
          ) : (
            <div className="product-grid">
              {userProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;