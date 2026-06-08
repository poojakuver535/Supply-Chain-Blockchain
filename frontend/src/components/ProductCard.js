import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
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

  // Function to get status color
  const getStatusColor = (status) => {
    switch (parseInt(status)) {
      case 0:
        return 'bg-blue-100 text-blue-800';
      case 1:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="product-card">
      <div className="card">
        <div className="product-image">
          {product.metadata && product.metadata.images && product.metadata.images.length > 0 ? (
            <img src={product.metadata.images[0]} alt={product.name} />
          ) : (
            <div className="no-image">No Image</div>
          )}
        </div>
        <div className="card-body">
          <h3 className="card-title">{product.name}</h3>
          <p className="card-text">{product.description}</p>
          
          <div className="product-info">
            <div className="status-badge">
              <span className={getStatusColor(product.status)}>
                {getStatusText(product.status)}
              </span>
            </div>
            
            <p className="manufacturer">
              <strong>Manufacturer:</strong>{' '}
              {product.metadata && product.metadata.createdBy 
                ? product.metadata.createdBy.company 
                : 'Unknown'}
            </p>
            
            <p className="category">
              <strong>Category:</strong>{' '}
              {product.metadata && product.metadata.category ? product.metadata.category : 'N/A'}
            </p>
            
            <p className="date">
              <strong>Created:</strong>{' '}
              {new Date(parseInt(product.timestamp) * 1000).toLocaleDateString()}
            </p>
          </div>
          
          <Link to={`/product/${product.id}`} className="btn btn-primary">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;