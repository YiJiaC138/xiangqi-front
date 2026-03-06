import { useState, useEffect } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import GameBoard from './gameBoard'
import Menu from './Menu'
import Notification from './Notification'
import { useWebSocket } from './context/WebSocketContext'

function App() {
  const { isConnected } = useWebSocket();
  const [showNotification, setShowNotification] = useState(true);
  const [message, setMessage] = useState('Connecting to Server...');

  useEffect(() => {
    if (isConnected) {
      setMessage('Server Connected Successfully');
      setTimeout(() => setShowNotification(false), 3000);
    } else {
      setMessage('Connecting to Server...');
      setShowNotification(true);
    }
  }, [isConnected]);

  return (
    <div>
      <Notification 
        message={message} 
        type={isConnected ? 'success' : 'loading'} 
        show={showNotification} 
      />
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/game/:roomId" element={<GameBoard />} />
      </Routes>
    </div>
  )
}

export default App
