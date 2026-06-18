import React from 'react';
import './Header.css';

const Header = ({ onNavigate }) => {
  return (
    <div className="header-container">
      <button type="button" onClick={() => onNavigate('home')} className="reci-text">Reci</button>
      <button type="button" onClick={() => onNavigate('about')} className="docs-text">about</button>
      <div className="oose-text">github</div>
    </div>
  );
};

export default Header;
