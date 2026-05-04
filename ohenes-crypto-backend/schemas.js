const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

// Cryptocurrency Schema
const cryptoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  change24h: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Crypto = mongoose.model('Crypto', cryptoSchema);

module.exports = { User, Crypto };
