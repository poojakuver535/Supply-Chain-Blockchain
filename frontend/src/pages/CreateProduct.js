import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

const CreateProduct = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    manufacturerName: '',
    manufacturerLocation: '',
    manufacturerContact: '',
    images: [],
    attributes: {}
  });
  
  const [attributeInputs, setAttributeInputs] = useState([{ key: '', value: '' }]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Check if user is authorized
    if (user && !user.isAuthorized) {
      alert('You are not authorized to create products. Please wait for an admin to authorize your account.');
      navigate('/dashboard');
    }
    
    // Pre-fill manufacturer info
    if (user) {
      setFormData({
        ...formData,
        manufacturerName: user.company
      });
    }
  }, [isAuthenticated, user, navigate]);
  
  const {
    name,
    description,
    category,
    manufacturerName,
    manufacturerLocation,
    manufacturerContact
  } = formData;
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleAttributeChange = (index, field, value) => {
    const newAttributeInputs = [...attributeInputs];
    newAttributeInputs[index][field] = value;
    setAttributeInputs(newAttributeInputs);
  };
  
  const addAttributeInput = () => {
    setAttributeInputs([...attributeInputs, { key: '', value: '' }]);
  };
  
  const removeAttributeInput = (index) => {
    const newAttributeInputs = [...attributeInputs];
    newAttributeInputs.splice(index, 1);
    setAttributeInputs(newAttributeInputs);
  };
  
  const handleImageUpload = (e) => {
    // In a real app, you would upload to a server and get URLs
    // For this demo, we'll just store the file names
    const fileNames = Array.from(e.target.files).map(file => file.name);
    setFormData({ ...formData, images: fileNames });
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Convert attribute inputs to object
    const extraAttributes = {};
    attributeInputs.forEach(attr => {
      if (attr.key.trim() !== '' && attr.value.trim() !== '') {
        extraAttributes[attr.key] = attr.value;
      }
    });
    
    const productData = {
      name,
      description,
      category,
      manufacturer: {
        name: manufacturerName,
        location: manufacturerLocation,
        contactInfo: manufacturerContact
      },
      images: formData.images,
      extraAttributes
    };
    
    setLoading(true);
    
    try {
      const res = await api.post('/api/products', productData);
      alert(`Product created successfully with ID: ${res.data.productId}`);
      navigate(`/product/${res.data.productId}`);
    } catch (err) {
      console.error('Error creating product:', err);
      alert('Error creating product');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="create-product">
      <h1 className="large text-primary">Create New Product</h1>
      <p className="lea