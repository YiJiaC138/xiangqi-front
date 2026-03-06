import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { Room, PlayerColor } from '../types/websocket';
import { useNavigate } from 'react-router-dom';

const RoomSelection: React.FC = () => {
  const { isConnected, sendMessage, subscribe } = useWebSocket();
  const [rooms, setRooms] = useState<Room[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected) {
      sendMessage({ type: 'GET_ROOMS' });
    }
  }, [isConnected, sendMessage]);

  useEffect(() => {
    // Subscribe to messages
    const unsubRoomUpdate = subscribe('ROOM_UPDATE', (payload) => {
        setRooms(payload);
    });

    const unsubJoinSuccess = subscribe('JOIN_SUCCESS', (payload) => {
        // Pass gameState if available, otherwise just navigate
        navigate(`/game/${payload.roomId}`, { 
            state: { 
                initialGameState: payload.gameState,
                color: payload.color // Pass assigned color
            } 
        });
    });

    const unsubError = subscribe('ERROR', (payload) => {
        alert(payload.message);
    });

    return () => {
        unsubRoomUpdate();
        unsubJoinSuccess();
        unsubError();
    };
  }, [subscribe, navigate]);

  const handleJoin = (roomId: string, color: PlayerColor) => {
    sendMessage({ type: 'JOIN_GAME', payload: { roomId, color } });
  };

  if (!isConnected) {
    return <div>Connecting to server...</div>;
  }

  return (
    <div className="room-selection">
      <h2>Select a Room</h2>
      <div className="rooms-list">
        {rooms.map((room) => (
          <div key={room.id} className="room-card">
            <h3>Room {room.id}</h3>
            <div className="room-actions">
              <button
                disabled={room.redPlayer !== null}
                onClick={() => handleJoin(room.id, 'red')}
              >
                Join as Red {room.redPlayer ? '(Taken)' : ''}
              </button>
              <button
                disabled={room.blackPlayer !== null}
                onClick={() => handleJoin(room.id, 'black')}
              >
                Join as Black {room.blackPlayer ? '(Taken)' : ''}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomSelection;
