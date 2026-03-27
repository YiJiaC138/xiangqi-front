import { useState, useEffect } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import GameBoard from './gameBoard'
import Menu from './Menu'
import RoomSelection from './components/RoomSelection'
import Notification from './Notification'
import { useWebSocket } from './context/WebSocketContext'

function App() {
  const { isConnected } = useWebSocket();
  const [showNotification, setShowNotification] = useState(true);
  const [message, setMessage] = useState('Connecting to Server...');

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;
    let wakeUpTimer: ReturnType<typeof setTimeout>;

    if (isConnected) {
      setMessage('Server Connected Successfully');
      hideTimer = setTimeout(() => setShowNotification(false), 3000);
    } else {
      setMessage('Connecting to Server...');
      setShowNotification(true);
      // If still connecting after 3 seconds, show waking up message
      wakeUpTimer = setTimeout(() => {
        setMessage('Server is waking up (this may take up to 60s)...');
      }, 3000);
    }

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(wakeUpTimer);
    };
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
        <Route path="/select" element={<RoomSelection />} />
        <Route path="/game/:roomId" element={<GameBoard />} />
      </Routes>
    </div>
  )
}

export default App
