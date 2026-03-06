import { GameState } from '../gameState';
import { Player } from '../chessPiece';

export type PlayerColor = 'red' | 'black';

export interface Room {
  id: string;
  redPlayer: string | null; // socket ID or player name
  blackPlayer: string | null;
  status: 'waiting' | 'playing';
}

export interface JoinRoomPayload {
  roomId: string;
  color: PlayerColor;
}

export interface MovePayload {
  roomId: string;
  move: string; // "y1x1y2x2"
}

export interface GetLegalMovesPayload {
  roomId: string;
  pieceX: number; // backend x
  pieceY: number; // backend y
}

export interface MoveLogEntry {
    player: Player;
    pieceChar: string;
    source: { x: number, y: number };
    target: { x: number, y: number };
    capturedChar?: string;
    isCheck?: boolean;
    isCheckmate?: boolean;
}

// Messages sent FROM Client TO Server
export type ClientMessage =
  | { type: 'GET_ROOMS' }
  | { type: 'JOIN_GAME'; payload: JoinRoomPayload }
  | { type: 'LEAVE_GAME'; payload: { roomId: string } }
  | { type: 'MOVE'; payload: MovePayload }
  | { type: 'RESET'; payload: { roomId: string } }
  | { type: 'UNDO'; payload: { roomId: string } }
  | { type: 'GET_LEGAL_MOVES'; payload: GetLegalMovesPayload }
  | { type: 'GET_GAME_STATE'; payload: { roomId: string } };

// Messages sent FROM Server TO Client
export type ServerMessage =
  | { type: 'ROOM_UPDATE'; payload: Room[] }
  | { type: 'GAME_STATE'; payload: GameState }
  | { type: 'ERROR'; payload: { message: string } }
  | { type: 'JOIN_SUCCESS'; payload: { roomId: string; color: PlayerColor; gameState?: GameState } }
  | { type: 'LEGAL_MOVES'; payload: { moves: { x: number; y: number }[] } }
  | { type: 'MOVE_LOG'; payload: MoveLogEntry };
