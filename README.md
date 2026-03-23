# Xiangqi Frontend (Chinese Chess)

This is the frontend application for a Xiangqi (Chinese Chess) game, built with React, TypeScript, and Vite. It interacts with a backend service to manage game logic and state.

## How to Run

### Prerequisites
- Node.js installed on your machine.
- Ensure there is a running backend from 

### Running Development Server
To start the local development server:
```bash
npm install
npm run dev
```


## Features Checklist

- [x] **Game Board UI**: Interactive Xiangqi board rendering.
- [x] **Chess Pieces**: 
  - Distinct characters for Red and Black sides (Soldier, Cannon, Chariot, Horse, Elephant, Advisor, General).
  - Visual distinction between players (Red vs Black).
- [x] **Game Logic Integration**:
  - Connects to backend API for valid move calculation.
  - Enforces turn-based play (Red goes first).
  - Real-time board state updates.
- [x] **Move Validation**:
  - Highlights available moves for selected pieces.
  - Prevents illegal moves based on backend rules.
- [x] **Game Status Indicators**:
  - Detects and displays **Check** condition.
  - Detects and displays **Checkmate**.
  - Detects and displays **Stalemate**.
  - Handles **Game Over** states.
- [x] **Move History Log**:
  - Side panel displaying a chronological list of moves.
  - Shows source and target coordinates.
  - Indicates captured pieces.
  - specific notation for Check (+) and Checkmate (#).
- [x] **Game Controls**:
  - **Reset Game**: Button to restart the match.
  - **Undo Move**: Ability to revert the last move.
- [x] **Game Lobby**: Can join game rooms.
- [x] **Multiplayer Support**: Enable multiple browsers to play the same game 
- [x] **Deployment**: Deploy on GitHub 

Backend Logic and be found [here](https://github.com/YiJiaC138/xiangqi)

[DEPLOYED HERE](https://xiangqi-front.onrender.com) (Takes awhile upon bootup)