import React from 'react';
import { Player } from './chessPiece';
import { MoveLogEntry } from './types/websocket';

interface PanelLogProps {
    history: MoveLogEntry[];
}

const PanelLog: React.FC<PanelLogProps> = ({ history }) => {
    return (
        <div style={{
            width: '200px',
            height: '600px',
            border: '1px solid #ccc',
            marginLeft: '20px',
            overflowY: 'auto',
            backgroundColor: '#f5e0b7',
            display: 'flex',
            flexDirection: 'column',
            padding: '10px',
            color: 'black'
        }}>
            <h3>Move History</h3>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {history.map((move, index) => (
                    <li key={index} style={{ 
                        borderBottom: '1px solid #a3a3a3', 
                        padding: '5px 0',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <span style={{ marginRight: '5px' }}>{index + 1}.</span>
                        <span style={{ color: move.player === 'red' ? 'red' : 'black', fontWeight: 'bold' }}>
                            {move.player === 'red' ? 'Red' : 'Black'}
                        </span>
                        : 
                        <span style={{ color: move.player === 'red' ? 'red' : 'black', marginLeft: '3px' }}>
                             {move.pieceChar}
                        </span>
                        <span style={{ marginLeft: '5px' }}>
                            ({move.source.x},{move.source.y}) &rarr; ({move.target.x},{move.target.y})
                        </span>
                        {move.capturedChar && (
                            <span style={{ marginLeft: '5px' }}>
                                captures <span style={{ color: move.player === 'red' ? 'black' : 'red' }}>{move.capturedChar}</span>
                            </span>
                        )}
                        {move.isCheckmate && (
                            <span style={{ marginLeft: '5px', fontWeight: 'bold', color: 'red' }}>#</span>
                        )}
                        {!move.isCheckmate && move.isCheck && (
                            <span style={{ marginLeft: '5px', fontWeight: 'bold', color: 'red' }}>+</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PanelLog;
