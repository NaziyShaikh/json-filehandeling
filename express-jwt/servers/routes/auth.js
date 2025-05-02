
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');  

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    
    const usersPath = path.join(__dirname, '../data/users.json');
    let users = [];
    
    try {
        const data = fs.readFileSync(usersPath);
        users = JSON.parse(data);
    } catch (error) {
        console.log('No existing users file found');
    }

    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});


router.post('/register', (req, res) => {
    const { username, password } = req.body;
    
    
    const usersPath = path.join(__dirname, '../data/users.json');
    let users = [];
    
    try {
        const data = fs.readFileSync(usersPath);
        users = JSON.parse(data);
    } catch (error) {
        console.log('No existing users file found');
    }

    
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    
    users.push({ username, password });
    
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    
    res.json({ success: true, message: 'Registration successful' });
});

module.exports = router;