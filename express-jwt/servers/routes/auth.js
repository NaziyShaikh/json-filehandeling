// servers/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
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

        res.json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        
        // Validate required fields
        if (!username || !password || !email) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Clear previous data
        await User.deleteMany({});

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

module.exports = router;