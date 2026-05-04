const express = require('express');
const { protectRoute } = require('./middleware');
const {
  registerUser,
  loginUser,
  getUserProfile,
  getAllCryptos,
  getTopGainers,
  getNewListings,
  addCrypto
} = require('./controllers');

const router = express.Router();

// --- 1. Authentication System ---
router.post('/register', registerUser);
router.post('/login', loginUser);

// --- 2. Protected User Profile Page ---
router.get('/profile', protectRoute, getUserProfile);

// --- 3. Crypto Data Integration ---
router.get('/crypto', getAllCryptos);
router.get('/crypto/gainers', getTopGainers);
router.get('/crypto/new', getNewListings);
router.post('/crypto', addCrypto);

module.exports = router;
