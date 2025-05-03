
const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

app.use(cors());

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);

});

const SECRET_KEY = process.env.JWT_SECRET || '1234';  

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the file handeling of backend',
        endpoints: {
            auth: {
                register: '/api/auth/register',
                login: '/api/auth/login',
                save: '/api/auth/save',
                data: '/api/auth/data'
            }
        },
        timestamp: new Date().toISOString()
    });
});

app.use(cors());
app.use(express.json());  
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});