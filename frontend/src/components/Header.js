import React from 'react';
import './Header.css';

const Header = ({ onNavigate }) => {
  return (
    <div className="header-container">
      <button type="button" onClick={() => onNavigate('home')} className="reci-text">Reci</button>
      <button type="button" onClick={() => onNavigate('about')} className="about-text">about</button>
      <a
        href="https://github.com/BSSMeghana/Reci"
        target="_blank"
        rel="noreferrer"
        className="github-text"
      >
        github
      </a>
    </div>
  );
};

export default Header;
