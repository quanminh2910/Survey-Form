const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This middleware function protects routes that require a user to be logged in.
const protect = async (req, res, next) => {
    let token;

    // Check if the request headers contain an "Authorization" header that starts with "Bearer"
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header (e.g., "Bearer eyJhbGciOiJIUz...") -> "eyJhbGciOiJIUz..."
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user by the id stored in the token and attach it to the request object
            // We exclude the password field for security
            req.user = await User.findById(decoded.user.id).select('-password');

            // Proceed to the next middleware or the route handler
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ msg: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ msg: 'Not authorized, no token' });
    }
};

module.exports = { protect };
