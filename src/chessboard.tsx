import React from 'react';
import RenderPiece, { ChessPiece, Player } from './chessPiece';

interface RenderChessBoardProps {
    pieces: ChessPiece[];
    availableMoves: {x: number, y: number}[];
    playerTurn: Player;
    isCheckmate: boolean;
    isGameOver: boolean;
    isCheck: boolean;
    isStalemate: boolean;
    onGetMoves: (piece: ChessPiece) => void;
    onClearMoves: () => void;
    onMove: (source: {x: number, y: number}, target: {x: number, y: number}) => void;
    onReset: () => void;
    onUndo: () => void;
    onBackToMenu: () => void;
    sidePanel?: React.ReactNode;
}

const RenderChessBoard: React.FC<RenderChessBoardProps> = ({
    pieces,
    availableMoves,
    playerTurn,
    isCheckmate,
    isGameOver,
    isCheck,
    isStalemate,
    onGetMoves,
    onClearMoves,
    onMove,
    onReset,
    onUndo,
    onBackToMenu,
    sidePanel
}) => {
  
  // Event handlers
  const handleDragStart = (e: React.DragEvent, pieceId: string) => {
    // console.log("Dragging piece:", pieceId);
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;

    // Only allow moving current player's pieces
    if (piece.player !== playerTurn) {
        // e.preventDefault(); // Prevents dragging, but might need to be done onDragStart logic in RenderPiece
      return;
    }

    e.dataTransfer.setData("PieceId", pieceId);
    onGetMoves(piece);
  }

  const handleDragOver = (e:React.DragEvent) => {
    e.preventDefault();
  }

  const handleDrop = (e: React.DragEvent, x:number, y:number) => {
    e.preventDefault();
    const pieceId = e.dataTransfer.getData("PieceId");
    const piece = pieces.find(p => p.id === pieceId);
    
    if (!piece) return;
    
    // Check if move is in available moves
    const isLegal = availableMoves.some(m => m.x === x && m.y === y);
    if (!isLegal) {
        console.log("Illegal move");
        onClearMoves();
      return;
    }

    onMove({x: piece.x, y: piece.y}, {x, y});
  }

  // Render the chessboard grid here
    return (
      <div className="page-wrapper">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="game-status">
                <h2>
                    {isCheckmate ? `${playerTurn === "red" ? "Black" : "Red"} wins by Checkmate!` : 
                    isStalemate ? "Stalemate!" : 
                    isCheck ? "Check!" : 
                    isGameOver ? "Game Over!" : ""}
                </h2>
                <h2>
                    {isGameOver ? "Game Over!" : (
                        <span style={{ color: playerTurn === "red" ? "red" : "black" }}>
                            {playerTurn === "red" ? "Red's Turn" : "Black's Turn"}
                        </span>
                    )}
                </h2>
            </div>
            <div className="board-container" style={{position:"relative"}}>
                <div className="xiangqi-board">
                {Array.from({ length: 9 }).map((_, row) =>
                Array.from({ length: 8 }).map((_, col) => {
                const isRiver = row === 4;
                const isPalace = (
                // Black palace: top 3 rows in center
                (row >= 0 && row <= 1 && col >= 3 && col <= 4) ||
                // Red palace: bottom 3 rows in center
                (row >= 7 && row <= 8 && col >= 3 && col <= 4)
                );

                let className = "cell";
                if (isRiver) className += " river";
                else if (isPalace) className += " palace";

                return <div key={`${row}-${col}`} className={className}></div>;
            })
            )}
            </div>
            {/* Front invisible grid layer */}
            <div className="front-layer">
            {Array.from({ length: 10 }).map((_, row) =>
                Array.from({ length: 9 }).map((_, col) => {
                // Check if there is a piece on this position
                const piece = pieces.find(p => p.x === col && p.y === row);
                // Check availability
                const isAvailableMove = availableMoves.some((m) => m.x === col && m.y === row);

                return(
                <div
                    key={`cell-${row}-${col}`}
                    className="invisible-cell"
                    data-row={row}
                    data-col={col}
                    style={{
                    position: "absolute",
                    top: `${(row / 10) * 100}%`,
                    left: `${(col / 9) * 100}%`,
                    width: "calc(100% / 9)",
                    height: "calc(100% / 10)",
                    pointerEvents: "auto"
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col, row)}
                >
                {isAvailableMove && (
                    <div className={`move-indicator ${piece ? "capture" : "empty"}`}></div>
                )}
                {piece && (<RenderPiece
                    id={piece.id}
                    type={piece.type}
                    player={piece.player}
                    onDragStart={handleDragStart}
                />
                )}
                </div>
                )})
            )}
            </div>
            </div>
            <div className="controls">
                <button onClick={onReset}>Reset Game</button>
                <button onClick={onUndo}>Undo Move</button>
                <button onClick={onBackToMenu}>Main Menu</button>
            </div>
        </div>
        {sidePanel}
      </div>
      )

}

export default RenderChessBoard;
