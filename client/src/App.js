import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [jsonData, setJsonData] = useState('');
    const [responseData, setResponseData] = useState(null);

    const handleRegister = async () => {
        try {
            await axios.post('[https://json-filehandeling.onrender.com/api/auth/register', { username, password });
            alert('User registered successfully');
        } catch (error) {
            alert('Error registering user: ' + error.response.data.message);
        }
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post('https://json-filehandeling.onrender.com/api/auth/login', { username, password });
            localStorage.setItem('token', response.data.token);
            alert('Login successful');
        } catch (error) {
            alert('Error logging in: ' + error.response.data.message);
        }
    };

    const handleSaveData = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('https://json-filehandeling.onrender.com/api/auth/save', { data: jsonData }, {
                headers: { Authorization: token }
            });
            alert('Data saved successfully');
        } catch (error) {
            alert('Error saving data: ' + error.response.data.message);
        }
    };

    const handleReadData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://json-filehandeling.onrender.com/api/auth/read', {
                headers: { Authorization: token }
            });
            setResponseData(response.data);
        } catch (error) {
            alert('Error reading data: ' + error.response.data.message);
        }
    };

    return (
        <div className="container">
            <h1>User Authentication</h1>
            <div className="section">
                <h2>Register</h2>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button onClick={handleRegister}>Register</button>
            </div>
            <div className="section">
                <h2>Login</h2>
                <button onClick={handleLogin}>Login</button>
            </div>
            <div className="section">
                <h2>Save Data</h2>
                <textarea placeholder="Enter JSON data" value={jsonData} onChange={(e) => setJsonData(e.target.value)} />
                <button onClick={handleSaveData}>Save</button>
            </div>
            <div className="section">
                <h2>Read Data</h2>
                <button onClick={handleReadData}>Read</button>
                {responseData && <pre>{JSON.stringify(responseData, null, 2)}</pre>}
            </div>
        </div>
    );
};

export default App;
