import React, { useState } from 'react';
import './Menu.css';
import RoomSelection from './components/RoomSelection';

const Menu: React.FC = () => {
    const [showRoomSelection, setShowRoomSelection] = useState(false);

    return (
        <div className="menu-container">
            <h1 className="menu-title">Xiangqi (Chinese Chess)</h1>
            {!showRoomSelection ? (
                <div className="menu-options">
                    <button 
                        className="menu-button start-button" 
                        onClick={() => setShowRoomSelection(true)}
                    >
                        Start Game
                    </button>
                </div>
            ) : (
                <RoomSelection />
            )}
        </div>
    );
};

export default Menu;
