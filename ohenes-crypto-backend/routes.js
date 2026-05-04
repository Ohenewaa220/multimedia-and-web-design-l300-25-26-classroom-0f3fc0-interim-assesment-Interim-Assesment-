const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Crypto } = require('./schemas');
const { protectRoute } = require('./middleware');

const router = express.Router();

// --- 1. Authentication System ---

// Register User
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with that email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({ success: true, message: 'Registration successful', userId: newUser._id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Store token securely in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({ success: true, message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
});

// --- 2. Protected User Profile Page ---

router.get('/profile', protectRoute, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      profile: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        joinedAt: req.user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
});

// --- 3. Crypto Data Integration ---

// GET /crypto (All Tradable Cryptocurrencies)
router.get('/crypto', async (req, res) => {
  try {
    const cryptos = await Crypto.find({});
    res.status(200).json({ success: true, data: cryptos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching cryptocurrencies' });
  }
});

// GET /crypto/gainers (Top Gainers)
router.get('/crypto/gainers', async (req, res) => {
  try {
    // Sort by 24h change descending
    const gainers = await Crypto.find({}).sort({ change24h: -1 }).limit(10);
    res.status(200).json({ success: true, data: gainers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching gainers' });
  }
});

// GET /crypto/new (New Listings)
router.get('/crypto/new', async (req, res) => {
  try {
    // Sort by createdAt descending
    const newlyListed = await Crypto.find({}).sort({ createdAt: -1 }).limit(10);
    res.status(200).json({ success: true, data: newlyListed });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching new listings' });
  }
});

// POST /crypto (Add New Cryptocurrency)
router.post('/crypto', async (req, res) => {
  const { name, symbol, price, image, change24h } = req.body;

  if (!name || !symbol || !price) {
    return res.status(400).json({ success: false, message: 'Please provide name, symbol and price' });
  }

  try {
    const newCrypto = await Crypto.create({
      name,
      symbol,
      price,
      image: image || '',
      change24h: change24h || 0
    });
    res.status(201).json({ success: true, message: 'Cryptocurrency added', data: newCrypto });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating cryptocurrency', error: error.message });
  }
});

module.exports = router;
