const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Data = require('../models/data');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || '1234';

router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        

        if (!username || !password || !email) {
            return res.status(400).json({ error: 'Username, password, and email are required' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            password: hashedPassword,
            email
        });

        await user.save();
        
        res.status(201).json({ 
            message: 'User registered successfully',
            user: {
                username: user.username,
                email: user.email,
                _id: user._id
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        
        res.json({ 
            message: 'Login successful', 
            token,
            user: {
                username: user.username,
                _id: user._id
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

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
router.post('/save', verifyToken, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const data = new Data({
            userId: req.user._id,
            content
        });
        
        await data.save();
        res.status(201).json({
            message: 'Data saved successfully',
            data: {
                id: data._id,
                content: data.content,
                createdAt: data.createdAt
            }
        });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

router.get('/data', verifyToken, async (req, res) => {
    try {
        const data = await Data.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        
        res.json({
            message: 'Data retrieved successfully',
            data: data.map(item => ({
                id: item._id,
                content: item.content,
                createdAt: item.createdAt
            }))
        });
    } catch (error) {
        console.error('Read error:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

module.exports = router;