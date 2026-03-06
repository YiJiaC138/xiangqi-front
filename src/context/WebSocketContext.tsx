import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { ClientMessage, ServerMessage } from '../types/websocket';

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (message: ClientMessage) => void;
  // Deprecated: prefer subscribe
  lastMessage: ServerMessage | null;
  subscribe: (type: ServerMessage['type'], handler: (payload: any) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

const WEBSOCKET_URL = 'ws://localhost:8080/game';

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<ServerMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);
  
  // Subscribers map: MessageType -> Set<Handler>
  const subscribers = useRef<Map<string, Set<(payload: any) => void>>>(new Map());

  useEffect(() => {
    ws.current = new WebSocket(WEBSOCKET_URL);

    ws.current.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        console.log('Received message:', message);
        setLastMessage(message);

        // Notify subscribers
        const handlers = subscribers.current.get(message.type);
        if (handlers) {
          handlers.forEach(handler => {
             try {
                handler(message.payload);
             } catch (e) {
                console.error(`Error in subscriber for ${message.type}:`, e);
             }
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendMessage = useCallback((message: ClientMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  const subscribe = useCallback((type: ServerMessage['type'], handler: (payload: any) => void) => {
    if (!subscribers.current.has(type)) {
      subscribers.current.set(type, new Set());
    }
    subscribers.current.get(type)!.add(handler);

    // Cleanup function
    return () => {
      const handlers = subscribers.current.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          subscribers.current.delete(type);
        }
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, sendMessage, lastMessage, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
