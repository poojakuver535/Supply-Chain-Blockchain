const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const ProductMetadata = require('../models/ProductMetadata');
const QRCode = require('qrcode');

// Create a new product
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Check if user is authorized
    if (!user.isAuthorized) {
      return res.status(403).json({ msg: 'Not authorized to create products' });
    }
    
    const { name, description, category, manufacturer, extraAttributes, images } = req.body;
    
    // Get user's account from wallet address
    const accounts = await req.web3.eth.getAccounts();
    const userAccount = user.walletAddress;
    
    // Create product on blockchain
    const receipt = await req.supplyChainContract.methods
      .createProduct(name, description)
      .send({ from: userAccount, gas: 300000 });
    
    // Extract the product ID from the event
    const event = receipt.events.ProductCreated;
    const productId = event.returnValues.id;
    
    // Generate QR code with product info
    const qrCodeData = `${process.env.FRONTEND_URL}/product/${productId}`;
    const qrCode = await QRCode.toDataURL(qrCodeData);
    
    // Create metadata record
    const productMetadata = new ProductMetadata({
      productId,
      createdBy: user._id,
      images: images || [],
      category,
      manufacturer,
      extraAttributes,
      qrCode
    });
    
    await productMetadata.save();
    
    res.json({
      productId,
      name,
      description,
      manufacturer: user.company,
      walletAddress: user.walletAddress,
      qrCode,
      metadata: productMetadata
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    // Get product count from contract
    const productCount = await req.supplyChainContract.methods.productCount().call();
    
    const products = [];
    
    // Get each product
    for (let i = 1; i <= productCount; i++) {
      const product = await req.supplyChainContract.methods.getProduct(i).call();
      const metadata = await ProductMetadata.findOne({ productId: i }).populate('createdBy', 'name company');
      
      products.push({
        ...product,
        metadata: metadata || {}
      });
    }
    
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get a single product
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Get product from contract
    const product = await req.supplyChainContract.methods.getProduct(productId).call();
    
    // Get product metadata
    const metadata = await ProductMetadata.findOne({ productId }).populate('createdBy', 'name company');
    
    // Get product updates
    const updateCount = await req.supplyChainContract.methods.getProductStatusUpdatesCount(productId).call();
    const updates = [];
    
    for (let i = 1; i <= updateCount; i++) {
      const update = await req.supplyChainContract.methods.getStatusUpdate(productId, i).call();
      const updater = await User.findOne({ walletAddress: update.updatedBy });
      
      updates.push({
        ...update,
        updaterName: updater ? updater.name : 'Unknown',
        updaterCompany: updater ? updater.company : 'Unknown'
      });
    }
    
    res.json({
      product,
      metadata: metadata || {},
      updates
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update product status
router.post('/:id/update', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Check if user is authorized
    if (!user.isAuthorized) {
      return res.status(403).json({ msg: 'Not authorized to update products' });
    }
    
    const { status, location, comments } = req.body;
    const productId = req.params.id;
    
    // Get user's account from wallet address
    const userAccount = user.walletAddress;
    
    // Update product status on blockchain
    await req.supplyChainContract.methods
      .updateProductStatus(productId, status, location, comments)
      .send({ from: userAccount, gas: 200000 });
    
    // Get updated product
    const product = await req.supplyChainContract.methods.getProduct(productId).call();
    
    res.json({
      msg: 'Product status updated successfully',
      product
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;