// servers/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || '1234';  // Added this line

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        
        if (!username || !password || !email) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Create new user
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = new User({
            username,
            password: hashedPassword,
            email
        });

        const savedUser = await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// JWT verification middleware
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = decoded;
        next();
    });
};

// Protected routes
router.post('/save', verifyToken, async (req, res) => {
    try {
        const { data } = req.body;
        // Here you would typically save the data to your database
        // For now, we'll just return a success message
        res.json({ message: 'Data saved successfully', data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

router.get('/read', verifyToken, async (req, res) => {
    try {
        // Here you would typically fetch the data from your database
        // For now, we'll just return a sample response
        res.json({ message: 'Data read successfully', data: {} });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});

module.exports = router;