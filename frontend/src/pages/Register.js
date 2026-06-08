import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Web3 from 'web3';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    walletAddress: '',
    role: 'manufacturer',
    company: ''
  });
  
  const [web3Enabled, setWeb3Enabled] = useState(false);
  const { register, isAuthenticated, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Clear any previous errors
    clearError();
    
    // Check if Web3 is available
    const checkWeb3 = async () => {
      if (window.ethereum) {
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          setWeb3Enabled(true);
        } catch (error) {
          console.error('User denied account access');
        }
      } else if (window.web3) {
        setWeb3Enabled(true);
      } else {
        console.log('No Ethereum browser extension detected');
      }
    };
    
    checkWeb3();
  }, [isAuthenticated, navigate, clearError]);
  
  const { name, email, password, password2, walletAddress, role, company } = formData;
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setFormData({ ...formData, walletAddress: accounts[0] });
      } catch (error) {
        console.error('User denied account access');
      }
    } else {
      alert('Please install MetaMask or another Ethereum wallet extension');
    }
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== password2) {
      alert('Passwords do not match');
      return;
    }
    
    try {
      await register({
        name,
        email,
        password,
        walletAddress,
        role,
        company
      });
      // Navigation happens in useEffect after isAuthenticated changes
    } catch (err) {
      console.error('Registration error:', err);
    }
  };
  
  return (
    <div className="register-page">
      <h1 className="large text-primary">Sign Up</h1>
      <p className="lead">
        <i className="fas fa-user"></i> Create Your Account
      </p>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {!web3Enabled && (
        <div className="alert alert-warning">
          You need a Web3 wallet like MetaMask to use this application.{' '}
          <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">
            Install MetaMask
          </a>
        </div>
      )}
      
      <form className="form" onSubmit={onSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={name}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={onChange}
            minLength="6"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="password2"
            value={password2}
            onChange={onChange}
            minLength="6"
            required
          />
        </div>
        <div className="form-group">
          <div className="wallet-input-group">
            <input
              type="text"
              placeholder="Ethereum Wallet Address"
              name="walletAddress"
              value={walletAddress}
              onChange={onChange}
              required
              disabled={!web3Enabled}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={connectWallet}
              disabled={!web3Enabled}
            >
              Connect Wallet
            </button>
          </div>
        </div>
        <div className="form-group">
          <select name="role" value={role} onChange={onChange} required>
            <option value="manufacturer">Manufacturer</option>
            <option value="distributor">Distributor</option>
            <option value="retailer">Retailer</option>
          </select>
          <small className="form-text">Select your role in the supply chain</small>
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Company Name"
            name="company"
            value={company}
            onChange={onChange}
            required
          />
        </div>
        <input
          type="submit"
          className="btn btn-primary"
          value="Register"
          disabled={!web3Enabled}
        />
      </form>
      
      <p className="my-1">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </div>
  );
};

export default Register;