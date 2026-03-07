import React from 'react';
import RenderPiece, { ChessPiece, Player } from './chessPiece';

interface RenderChessBoardProps {
    pieces: ChessPiece[];
    availableMoves: {x: number, y: number}[];
    playerTurn: Player;
    myColor: Player | null; // Added prop
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
    myColor,
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
  const [draggingPieceId, setDraggingPieceId] = React.useState<string | null>(null);
  const [dragPosition, setDragPosition] = React.useState<{x: number, y: number} | null>(null);
  const dragOffset = React.useRef<{x: number, y: number}>({x: 0, y: 0});
  
  // Empty image for drag ghost
  const emptyImg = React.useRef<HTMLImageElement | null>(null);

  React.useEffect(() => {
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    emptyImg.current = img;
  }, []);

  const getLogicalPos = (visualRow: number, visualCol: number) => {
    if (myColor === 'black') {
      return { x: 8 - visualCol, y: 9 - visualRow };
    }
    return { x: visualCol, y: visualRow };
  };
  
  // Event handlers
  const handleDragStart = (e: React.DragEvent, pieceId: string) => {
    // console.log("Dragging piece:", pieceId);
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;
    
    // Check if player is allowed to move this piece
    if (myColor && piece.player !== myColor) {
        console.warn(`Cannot drag ${piece.player} piece as ${myColor}`);
        return;
    }

    if (piece.player !== playerTurn) {
        console.warn(`It is ${playerTurn}'s turn, not ${piece.player}'s`);
        return;
    }
    
    // Calculate offset from mouse to element top-left
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    
    // Set initial drag position
    setDragPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
    });

    e.dataTransfer.setData("PieceId", pieceId);
    e.dataTransfer.effectAllowed = "move";
    
    // Set empty drag image
    if (emptyImg.current) {
        e.dataTransfer.setDragImage(emptyImg.current, 0, 0);
    }
    
    // Use setTimeout to ensure the drag image is created before hiding the element
    setTimeout(() => {
        setDraggingPieceId(pieceId);
    }, 0);

    onGetMoves(piece);
  }

  const handleDrag = (e: React.DragEvent) => {
    // Check if valid coordinates (DragEvent sometimes fires with 0,0 at end)
    if (e.clientX === 0 && e.clientY === 0) return;
    
    setDragPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
    });
  }

  const handleDragEnd = () => {
    setDraggingPieceId(null);
    setDragPosition(null);
  }

  const handleDragOver = (e:React.DragEvent) => {
    e.preventDefault();
  }

  const handleDrop = (e: React.DragEvent, x:number, y:number) => {
    e.preventDefault();
    const pieceId = e.dataTransfer.getData("PieceId");
    const piece = pieces.find(p => p.id === pieceId);
    
    if (!piece) return;
    console.log("Dropping piece:", pieceId, "at", x, y);
    // Check if move is in available moves
    const isLegal = availableMoves.some(m => m.x === x && m.y === y);
    if (!isLegal) {
        console.log("Illegal move");
        onClearMoves();
      return;
    }

    onMove({x: piece.x, y: piece.y}, {x, y});
    setDraggingPieceId(null);
    setDragPosition(null);
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
                const { x: lx, y: ly } = getLogicalPos(row, col);
                const logicalRow = (myColor === 'black') ? ly - 1 : ly;
                const logicalCol = (myColor === 'black') ? lx - 1 : lx;
                
                const isRiver = logicalRow === 4;
                const isPalace = (
                // Black palace: top 3 rows in center
                (logicalRow >= 0 && logicalRow <= 1 && logicalCol >= 3 && logicalCol <= 4) ||
                // Red palace: bottom 3 rows in center
                (logicalRow >= 7 && logicalRow <= 8 && logicalCol >= 3 && logicalCol <= 4)
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
                const { x: logicalCol, y: logicalRow } = getLogicalPos(row, col);
                // Check if there is a piece on this position
                const piece = pieces.find(p => p.x === logicalCol && p.y === logicalRow);
                // Check availability
                const isAvailableMove = availableMoves.some((m) => m.x === logicalCol && m.y === logicalRow);

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
                    onDrop={(e) => handleDrop(e, logicalCol, logicalRow)}
                >
                {isAvailableMove && (
                    <div className={`move-indicator ${piece ? "capture" : "empty"}`}></div>
                )}
                {piece && (<RenderPiece
                    id={piece.id}
                    type={piece.type}
                    player={piece.player}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDrag={handleDrag}
                    isDragging={draggingPieceId === piece.id}
                />
                )}
                </div>
                )})
            )}
            </div>
            </div>
            {/* Custom Drag Layer */}
            {draggingPieceId && dragPosition && (() => {
                const piece = pieces.find(p => p.id === draggingPieceId);
                if (!piece) return null;
                return (
                    <div style={{
                        position: 'fixed',
                        left: dragPosition.x,
                        top: dragPosition.y,
                        zIndex: 1000,
                        pointerEvents: 'none',
                    }}>
                         <RenderPiece
                            id={piece.id}
                            type={piece.type}
                            player={piece.player}
                            onDragStart={()=>{}} // Dummy
                            onDragEnd={()=>{}} // Dummy
                        />
                    </div>
                );
            })()}
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
