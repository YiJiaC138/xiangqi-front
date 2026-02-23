import { useState, useEffect } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import GameBoard from './gameBoard'
import Menu from './Menu'
import Notification from './Notification'
import axios from 'axios'

const API_URL = "http://localhost:8080/api/game";

function App() {
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | 'loading'>('loading');
  const [showNotification, setShowNotification] = useState(true);
  const [message, setMessage] = useState('Checking Connection...');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Try to fetch board state as a health check
        await axios.get(`${API_URL}/board`);
        setConnectionStatus('success');
        setMessage('Backend Connected Successfully');
        // Hide success message after 3 seconds
        setTimeout(() => setShowNotification(false), 3000);
      } catch (err) {
        console.error("Connection check failed:", err);
        setConnectionStatus('error');
        setMessage('Backend Connection Failed');
        // Keep error message visible
        setShowNotification(true);
      }
    };

    checkConnection();
  }, []);

  return (
    <div>
      <Notification 
        message={message} 
        type={connectionStatus} 
        show={showNotification} 
      />
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/game" element={<GameBoard />} />
      </Routes>
    </div>
  )
}

export default App
