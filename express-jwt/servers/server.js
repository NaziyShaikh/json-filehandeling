// servers/server.js
const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');
const cors = require('cors');

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

app.use(cors());
app.use(express.json());  
app.use('/api', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});