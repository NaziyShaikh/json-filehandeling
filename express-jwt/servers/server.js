
const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');

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

const userDataFile = 'users.json';
const jsonDataFile = 'data.json';

const readUserData = () => {
    if (!fs.existsSync(userDataFile)) {
        return [];
    }
    const data = fs.readFileSync(userDataFile);
    return JSON.parse(data);
};

const writeUserData = (data) => {
    fs.writeFileSync(userDataFile, JSON.stringify(data, null, 2));
};

const User = require('../models/user');

app.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        

        if (!username || !password || !email) {
            return res.status(400).json({ error: 'All fields are required' });
        }

    
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

    
        const user = new User({
            username,
            password: bcrypt.hashSync(password, 10),
            email
        });

        const savedUser = await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = readUserData();

    const user = users.find(user => user.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.sendStatus(403);
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = decoded;
        next();
    });
};
app.post('/save', verifyToken, (req, res) => {
    const jsonData = req.body;

    fs.writeFileSync(jsonDataFile, JSON.stringify(jsonData, null, 2));
    res.json({ message: 'Data saved successfully' });
});

app.get('/read', verifyToken, (req, res) => {
    if (!fs.existsSync(jsonDataFile)) {
        return res.status(404).json({ message: 'No data found' });
    }
    const data = fs.readFileSync(jsonDataFile);
    res.json(JSON.parse(data));
});


app.get('/', (req, res) => {
    res.send('Welcome to the Express Backend API of file handeling ! The server is running.');
  });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});