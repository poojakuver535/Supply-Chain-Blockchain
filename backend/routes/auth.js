const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, walletAddress, role, company } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    
    // Check if wallet address is already registered
    user = await User.findOne({ walletAddress });
    if (user) {
      return res.status(400).json({ msg: 'Wallet address already registered' });
    }
    
    // Create new user
    user = new User({
      name,
      email,
      password,
      walletAddress,
      role,
      company,
      isAuthorized: false // New users need to be authorized by admin
    });
    
    await user.save();
    
    // Generate token
    const token = user.generateAuthToken();
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role,
        company: user.company,
        isAuthorized: user.isAuthorized
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Generate token
    const token = user.generateAuthToken();
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role,
        company: user.company,
        isAuthorized: user.isAuthorized
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Authorize users (admin only)
router.post('/authorize/:userId', auth, async (req, res) => {
  try {
    // Check if the requester is an admin
    const adminUser = await User.findById(req.user.id);
    if (adminUser.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to perform this action' });
    }
    
    // Get the user to authorize
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Update user's authorization status
    user.isAuthorized = true;
    await user.save();
    
    // Authorize on blockchain
    const accounts = await req.web3.eth.getAccounts();
    const adminAccount = accounts[0]; // Assuming admin is account 0
    
    await req.supplyChainContract.methods
      .addAuthorizedUser(user.walletAddress)
      .send({ from: adminAccount, gas: 200000 });
    
    res.json({ msg: 'User authorized successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;