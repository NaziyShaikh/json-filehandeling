const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Login route
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Read existing users from JSON file
    const usersPath = path.join(__dirname, '../data/users.json');
    let users = [];
    
    try {
        const data = fs.readFileSync(usersPath);
        users = JSON.parse(data);
    } catch (error) {
        console.log('No existing users file found');
    }

    // Find user
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Register route
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    
    // Read existing users
    const usersPath = path.join(__dirname, '../data/users.json');
    let users = [];
    
    try {
        const data = fs.readFileSync(usersPath);
        users = JSON.parse(data);
    } catch (error) {
        console.log('No existing users file found');
    }

    // Check if user exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    // Add new user
    users.push({ username, password });
    
    // Save to JSON file
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    
    res.json({ success: true, message: 'Registration successful' });
});

module.exports = router;