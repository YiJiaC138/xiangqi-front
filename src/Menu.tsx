import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Menu.css';

const Menu: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="menu-container">
            <h1 className="menu-title">Xiangqi (Chinese Chess)</h1>
            <div className="menu-options">
                <button 
                    className="menu-button start-button" 
                    onClick={() => navigate('/game')}
                >
                    Start Game
                </button>
            </div>
        </div>
    );
};

export default Menu;
