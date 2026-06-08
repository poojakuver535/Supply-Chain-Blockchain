import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import ProductTimeline from '../components/ProductTimeline';

const ProductDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusForm, setStatusForm] = useState({
    status: '1', // Default to In Transit
    location: '',
    comments: ''
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/${id}`);
        setProduct(res.data.product);
        setMetadata(res.data.metadata);
        setUpdates(res.data.updates);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  const { status, location, comments } = statusForm;
  
  const onChange = (e) => {
    setStatusForm({ ...statusForm, [e.target.name]: e.target.value });
  };
  
  // Function to get status text
  const getStatusText = (status) => {
    switch (parseInt(status)) {
      case 0:
        return 'Created';
      case 1:
        return 'In Transit';
      case 2:
        return 'Delivered';
      default:
        return 'Unknown';
    }
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!user.isAuthorized) {
      alert('You are not authorized to update product status');
      return;
    }
    
    try {
      await api.post(`/api/products/${id}/update`, statusForm);
      
      // Refresh product data
      const res = await api.get(`/api/products/${id}`);
      setProduct(res.data.product);
      setUpdates(res.data.updates);
      
      // Reset form
      setStatusForm({
        status: '1',
        location: '',
        comments: ''
      });
      
      alert('Product status updated successfully');
    } catch (err) {
      console.error('Error updating product status:', err);
      alert('Error updating product status');
    }
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!product) {
    return <div className="not-found">Product not found</div>;
  }
  
  return (
    <div className="product-details">
      <h1 className="large text-primary">{product.name}</h1>
      
      <div className="product-info-card">
        <div className="product-header">
          <div className="product-images">
            {metadata && metadata.images && metadata.images.length > 0 ? (
              <img src={metadata.images[0]} alt={product.name} className="main-image" />
            ) : (
              <div className="no-image">No Image Available</div>
            )}
          </div>
          
          <div className="product-info">
            <p className="product-description">{product.description}</p>
            
            <div className="product-metadata">
              <p>
                <strong>Status:</strong>{' '}
                <span className="status-badge">{getStatusText(product.status)}</span>
              </p>
              <p>
                <strong>Manufacturer:</strong>{' '}
                {metadata && metadata.createdBy ? metadata.createdBy.company : 'Unknown'}
              </p>
              <p>
                <strong>Category:</strong>{' '}
                {metadata && metadata.category ? metadata.category : 'N/A'}
              </p>
              <p>
                <strong>Created:</strong>{' '}
                {new Date(parseInt(product.timestamp) * 1000).toLocaleDateString()}
              </p>
              {metadata && metadata.extraAttributes && (
                <div className="extra-attributes">
                  <h3>Additional Information</h3>
                  <ul>
                    {Object.entries(metadata.extraAttributes).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {metadata && metadata.qrCode && (
          <div className="qr-code-section">
            <h3>Product QR Code</h3>
            <img src={metadata.qrCode} alt="Product QR Code" className="qr-code" />
            <p>Scan this code to verify product authenticity and view its journey</p>
          </div>
        )}
      </div>
      
      <div className="product-timeline-section">
        <h2>Product Journey</h2>
        <ProductTimeline updates={updates} />
      </div>
      
      {isAuthenticated && user.isAuthorized && parseInt(product.status) !== 2 && (
        <div className="update-product-section">
          <h2>Update Product Status</h2>
          <form className="form" onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                name="status"
                id="status"
                value={status}
                onChange={onChange}
                required
              >
                <option value="1">In Transit</option>
                <option value="2">Delivered</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                name="location"
                id="location"
                placeholder="Current location (e.g., Warehouse NYC)"
                value={location}
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="comments">Comments</label>
              <textarea
                name="comments"
                id="comments"
                placeholder="Additional information about this update"
                value={comments}
                onChange={onChange}
              ></textarea>
            </div>
            <input type="submit" className="btn btn-primary" value="Update Status" />
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;