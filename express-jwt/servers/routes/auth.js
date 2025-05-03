const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Data = require('../models/data');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || '1234';

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
        const token = jwt.sign({ username: user.username }, SECRET_KEY, { 
            expiresIn: '1h',
            algorithm: 'HS256'
        });
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});
// JWT verification middleware
async function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(403).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        // Find the user to get their _id
        const user = await User.findOne({ username: decoded.username });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = { 
            username: decoded.username,
            _id: user._id
        };
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Protected routes
router.post('/save', verifyToken, async (req, res) => {
    try {
        const data = new Data({
            userId: req.user._id,
            ...req.body
        });
        await data.save();
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

router.get('/data', verifyToken, async (req, res) => {
    try {
        const data = await Data.find({ userId: req.user._id });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

module.exports = router;