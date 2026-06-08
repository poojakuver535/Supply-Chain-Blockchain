const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Web3 = require('web3');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to Web3 provider
const web3 = new Web3(process.env.BLOCKCHAIN_URL || 'http://127.0.0.1:7545');

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Load contract ABI and address
const SupplyChain = require('./contracts/SupplyChain.json');
const contractAddress = process.env.CONTRACT_ADDRESS;
if (!contractAddress) {
  console.error('Contract address not set in environment variables');
}

// Make Web3 and contract instance available to routes
app.use((req, res, next) => {
  req.web3 = web3;
  req.supplyChainContract = new web3.eth.Contract(
    SupplyChain.abi,
    contractAddress
  );
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Server error', message: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));