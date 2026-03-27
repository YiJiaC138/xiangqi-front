import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Menu.css';

const Menu: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="menu-container">
            <div className="menu-title-container">
                <h1 className="menu-title">Xiangqi (Chinese Chess)</h1>
                <p className="menu-subtitle">
                    Experience Traditional Chinese Chess in Multiplayer Mode
                </p>
            </div>
            <div className="menu-options">
                <button 
                    className="menu-button start-button" 
                    onClick={() => navigate('/select')}
                >
                    Start Game
                </button>
            </div>
            <p className="menu-description">
                Play xiangqi (Chinese Chess) with your friends online!
                <br />
                This is a small and simple project intended just for self learning purposes.
                <br />
                Developed by <a href="https://github.com/YiJiaC138" target="_blank" rel="noopener noreferrer">YiJiaC138</a>
                
                </p>
        </div>
    );
};

export default Menu;
