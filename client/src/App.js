import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [jsonData, setJsonData] = useState('');
    const [responseData, setResponseData] = useState(null);

    const API_BASE_URL = 'https://json-filehandeling.onrender.com/api/auth';

    const handleRegister = async () => {
        try {
            await axios.post(`${API_BASE_URL}/register`, { 
                username, 
                password,
                email: `${username}@example.com`
            });
            alert('User registered successfully');
        } catch (error) {
            console.error('Registration error:', error);
            alert('Error registering user: ' + error.response?.data?.error || error.message);
        }
    };

  // client/src/App.js
  const handleLogin = async () => {
      try {
          const response = await axios.post(`${API_BASE_URL}/login`, { 
              username, 
              password 
          });
          const token = response.data.token;
          localStorage.setItem('token', token);
          alert('Login successful');
      } catch (error) {
          console.error('Login error:', error);
          alert('Error logging in: ' + error.response?.data?.error || error.message);
      }
  };
  
  const handleSaveData = async () => {
      try {
          const token = localStorage.getItem('token');
          if (!token) {
              return alert('Please login first');
          }
  
          const response = await axios.post(`${API_BASE_URL}/save`, { 
              data: jsonData 
          }, {
              headers: { 
                  Authorization: `Bearer ${token}`
              }
          });
          console.log('Save response:', response.data);
          alert('Data saved successfully');
      } catch (error) {
          console.error('Save error:', error);
          if (error.response?.data?.error) {
              alert('Error saving data: ' + error.response.data.error);
          } else {
              alert('Error saving data: ' + error.message);
          }
      }
  };
    const handleReadData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return alert('Please login first');
            }
            const response = await axios.get(`${API_BASE_URL}/read`, {
                headers: { 
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Read response:', response.data);
            setResponseData(response.data);
        } catch (error) {
            console.error('Read error:', error);
            alert('Error reading data: ' + error.response?.data?.error || error.message);
        }
    };

    return (
        <div className="container">
            <h1>User Authentication</h1>
            <div className="section">
                <h2>Register</h2>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <button onClick={handleRegister}>Register</button>
            </div>
            <div className="section">
                <h2>Login</h2>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <button onClick={handleLogin}>Login</button>
            </div>
            <div className="section">
                <h2>Save Data</h2>
                <textarea 
                    value={jsonData} 
                    onChange={(e) => setJsonData(e.target.value)} 
                    placeholder="Enter JSON data to save"
                    style={{ width: '100%', height: '100px' }}
                />
                <button onClick={handleSaveData}>Save Data</button>
            </div>
            <div className="section">
                <h2>Read Data</h2>
                <button onClick={handleReadData}>Read Data</button>
                {responseData && (
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {JSON.stringify(responseData, null, 2)}
                    </pre>
                )}
            </div>
        </div>
    );
};

export default App;