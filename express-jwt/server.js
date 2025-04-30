const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = '1234'; 

app.use(cors());
app.use(bodyParser.json());

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


app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const users = readUserData();


    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    users.push({ username, password: hashedPassword });
    writeUserData(users);

    res.status(201).json({ message: 'User registered successfully' });
});

//login of authentication
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

//save.json
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