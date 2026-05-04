require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./database');
const apiRoutes = require('./routes');

const app = express();

// Middleware setup
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to the Crypto App Backend API');
});

// API Routes mounting
// Note: Keeping it at the root matches the exact assessment paths (/register, /login, /profile, /crypto), or we could mount on /api. 
// We generally mount directly based on requirements.
app.use('/', apiRoutes);

// Error Fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started running nicely on port ${PORT}`));
