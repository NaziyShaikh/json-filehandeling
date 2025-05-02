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
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];  // Get the token after "Bearer"
    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Protected routes
router.post('/save', verifyToken, async (req, res) => {
    try {
        const { data } = req.body;
        const userId = req.user._id;

        // Create new data entry
        const savedData = new Data({
            userId,
            content: data
        });

        await savedData.save();

        res.json({ 
            message: 'Data saved successfully', 
            data: {
                id: savedData._id,
                content: savedData.content,
                createdAt: savedData.createdAt
            }
        });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

router.get('/read', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Find all data entries for this user
        const dataEntries = await Data.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10);  // Limit to last 10 entries

        res.json({ 
            message: 'Data read successfully', 
            data: dataEntries.map(entry => ({
                id: entry._id,
                content: entry.content,
                createdAt: entry.createdAt
            }))
        });
    } catch (error) {
        console.error('Read error:', error);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

module.exports = router;