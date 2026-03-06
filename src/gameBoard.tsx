import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import RenderChessBoard from './chessboard';
import PanelLog from './panellog';
import { GameState } from './gameState';
import { ChessPiece, Player, PieceType, getPieceCharacter } from './chessPiece';
import { useWebSocket } from './context/WebSocketContext';
import { MoveLogEntry } from './types/websocket';

const GameBoard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams<{ roomId: string }>();
  const { isConnected, sendMessage, subscribe } = useWebSocket();
  
  // State handlers
  const [pieces, setPieces] = useState<ChessPiece[]>([]); 
  const [availableMoves, setAvailableMoves] = useState<{x: number, y: number}[]>([]); 
  const [playerTurn, setPlayerTurn] = useState<Player>('red'); 
  const [myColor, setMyColor] = useState<Player | null>(null); // Track local player color
  const [isCheckmate, setIsCheckmate] = useState<boolean>(false); 
  const [isGameOver, setIsGameOver] = useState<boolean>(false); 
  const [isCheck, setIsCheck] = useState<boolean>(false);
  const [isStalemate, setIsStalemate] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [history, setHistory] = useState<MoveLogEntry[]>([]);
  
  useEffect(() => {
    // If we have initial state from navigation (from Join Room), use it
    if (location.state?.initialGameState) {
        console.log("Using initial game state from location");
        updateGameState(location.state.initialGameState);
    }
    
    // Set my color from navigation state
    if (location.state?.color) {
        console.log("Setting my color to:", location.state.color);
        setMyColor(location.state.color);
    } else {
        console.warn("No player color found in navigation state! You might be a spectator or need to rejoin.");
    }
    
    // Subscribe to messages
    const unsubGameState = subscribe('GAME_STATE', (payload) => {
        console.log("Received GAME_STATE:", payload);
        updateGameState(payload);
    });

    const unsubLegalMoves = subscribe('LEGAL_MOVES', (payload) => {
        console.log("Received LEGAL_MOVES:", payload);
        
        // Handle if payload IS the array (unwrapped) or HAS a 'moves' property
        let rawMoves = [];
        if (Array.isArray(payload)) {
            rawMoves = payload;
        } else if (payload && Array.isArray(payload.moves)) {
            rawMoves = payload.moves;
        } else {
            console.warn("Unknown LEGAL_MOVES payload format:", payload);
        }

        const moves = rawMoves.map((m: {x: number, y: number}) => ({
          x: m.y,
          y: m.x
        }));
        console.log("Mapped Available Moves:", moves);
        setAvailableMoves(moves);
    });

    const unsubError = subscribe('ERROR', (payload) => {
        console.error("Backend error:", payload.message);
        alert(`Error: ${payload.message}`);
    });

    const unsubMoveLog = subscribe('MOVE_LOG', (payload) => {
        setHistory(prev => [...prev, payload]);
    });

    return () => {
        unsubGameState();
        unsubLegalMoves();
        unsubError();
        unsubMoveLog();
    };
  }, [subscribe, location.state]);

  function indexToSquare(x: number, y: number): string {
    return `${x}${y}`;
  }

  function updateGameState(newState: GameState) {
    console.log("Updating Game State:", newState);
    if (!newState || !newState.pieces) {
        console.warn("Received invalid game state:", newState);
        return;
    }
    const newPieces: ChessPiece[] = (newState.pieces || []).map((p) => ({
      id: p.id,
      x: p.y, // Swap: backend y -> frontend x
      y: p.x, // Swap: backend x -> frontend y
      type: p.type as PieceType,
      player: p.player as Player,
    }));
    
    setPieces(newPieces);
    setPlayerTurn(newState.playerTurn as Player);
    setIsCheckmate(newState.isCheckmate);
    setIsStalemate(newState.isStalemate);
    setIsCheck(newState.isCheck);
    setIsGameOver(newState.isGameOver);
    setGameResult(newState.result);
  }

  function getMoves(piece: ChessPiece) {
    console.log("Getting moves for:", piece);
    if (!roomId) {
        console.warn("No roomId, cannot get moves");
        return;
    }
    sendMessage({
        type: 'GET_LEGAL_MOVES',
        payload: {
            roomId,
            pieceX: piece.y, // Backend X (Row)
            pieceY: piece.x  // Backend Y (Col)
        }
    });
  }

  function handleMove(source: {x: number, y: number}, target: {x: number, y: number}) {
    console.log("Handling move from:", source, "to:", target);
    if (!roomId) {
        console.warn("No roomId, cannot handle move");
        return;
    }
    const sourceSquare = indexToSquare(source.y, source.x);
    const targetSquare = indexToSquare(target.y, target.x);
    
    console.log("Sending move payload:", `${sourceSquare}${targetSquare}`);
    sendMessage({
        type: 'MOVE',
        payload: {
            roomId,
            move: `${sourceSquare}${targetSquare}`
        }
    });
    
    // Clear moves immediately
    setAvailableMoves([]);
  }

  function resetBoard() {
    if (!roomId) return;
    sendMessage({ type: 'RESET', payload: { roomId } });
    setAvailableMoves([]);
    setHistory([]);
  }

  function undoMove() {
    if (!roomId) return;
    sendMessage({ type: 'UNDO', payload: { roomId } });
    setAvailableMoves([]);
    setHistory(prev => prev.slice(0, -1));
  }

  return (
    <RenderChessBoard
        pieces={pieces}
        availableMoves={availableMoves}
        playerTurn={playerTurn}
        myColor={myColor}
        isCheckmate={isCheckmate}
        isGameOver={isGameOver}
        isCheck={isCheck}
        isStalemate={isStalemate}
        onGetMoves={getMoves}
        onClearMoves={() => setAvailableMoves([])}
        onMove={handleMove}
        onReset={resetBoard}
        onUndo={undoMove}
        onBackToMenu={() => navigate('/')}
        sidePanel={<PanelLog history={history} />}
    />
  );
}

export default GameBoard;
