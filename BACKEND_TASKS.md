# Backend Implementation Tasks for WebSocket Multiplayer

The frontend has been updated to use WebSockets for real-time gameplay and room management. The backend needs to implement the following to support these features.

## 1. WebSocket Endpoint
- [ ] Create a WebSocket endpoint at `/game` (e.g., `ws://localhost:8080/game`).
- [ ] Handle new connections and assigning unique session IDs to clients.
- [ ] Handle disconnections (clean up player from room if they leave).

## 2. Room Management
- [ ] Initialize 5 game rooms (IDs: "1", "2", "3", "4", "5") on server startup.
- [ ] Each room should track:
    - `id`: string
    - `redPlayer`: Session ID or null
    - `blackPlayer`: Session ID or null
    - `gameState`: The current board state (pieces, turn, etc.)
    - `status`: "waiting" or "playing"

## 3. Message Handling (Client -> Server)
The server must listen for JSON messages with a `type` field.

### `GET_ROOMS`
- [ ] **Action**: Return the current state of all rooms.
- [ ] **Response**: Send `ROOM_UPDATE` message to the requester.

### `JOIN_GAME`
- [ ] **Payload**: `{ roomId: string, color: 'red' | 'black' }`
- [ ] **Logic**:
    - Check if `roomId` exists.
    - Check if the requested `color` slot is empty.
    - If valid:
        - Assign the player's session to that slot.
        - Send `JOIN_SUCCESS` to the player. **Include `gameState` in the payload.**
        - Broadcast `ROOM_UPDATE` to **all connected clients** (to update menus).
    - If invalid (room full or color taken):
        - Send `ERROR` message with reason.

### `GET_GAME_STATE`
- [ ] **Payload**: `{ roomId: string }`
- [ ] **Logic**:
    - Retrieve current game state for `roomId`.
    - Send `GAME_STATE` to the requester.

### `MOVE`
- [ ] **Payload**: `{ roomId: string, move: string }` (e.g., move="0010" for y1x1y2x2)
- [ ] **Logic**:
    - Validate it is the player's turn.
    - Validate the move is legal for the current board state in `roomId`.
    - Apply the move to the game state.
    - **Broadcast**: Send updated `GAME_STATE` to **both players** in the room.
    - **Broadcast**: Send `MOVE_LOG` to both players (optional, for history panel).

### `GET_LEGAL_MOVES`
- [ ] **Payload**: `{ roomId: string, pieceX: number, pieceY: number }`
- [ ] **Logic**: Calculate valid moves for the specified piece.
- [ ] **Response**: Send `LEGAL_MOVES` to the requester.

### `RESET` / `UNDO`
- [ ] **Payload**: `{ roomId: string }`
- [ ] **Logic**: Reset board or undo last move for that specific room.
- [ ] **Broadcast**: Send updated `GAME_STATE` to both players in the room.

## 4. Message Structures (Server -> Client)

Ensure responses match these TypeScript interfaces:

```typescript
// Room Update
{
  type: 'ROOM_UPDATE',
  payload: [
    { id: "1", redPlayer: "session123", blackPlayer: null, status: "waiting" },
    // ... other rooms
  ]
}

// Join Success - Include gameState!
{
  type: 'JOIN_SUCCESS',
  payload: { 
      roomId: "1", 
      color: "red",
      gameState: { ... } // Optional but HIGHLY recommended to prevent race conditions
  }
}

// Game State (Same as existing REST response, wrapped)
{
  type: 'GAME_STATE',
  payload: {
    pieces: [...],
    playerTurn: "black",
    isGameOver: false,
    // ...
  }
}

// Error
{
  type: 'ERROR',
  payload: { message: "Room is full" }
}
```
