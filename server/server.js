// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // To use environment variables from .env file

// Import routes
const authRoutes = require('./routes/auth');

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
// Enable Cross-Origin Resource Sharing (CORS) to allow frontend to communicate with backend
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- API Routes ---
// This tells the app to use the auth routes for any request starting with /api/auth
app.use('/api/auth', authRoutes);

// A simple test route to make sure the server is running
app.get('/', (req, res) => {
    res.send('Survey App API is running!');
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
