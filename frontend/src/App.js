// src/App.js
import React, { useState } from 'react';
import Header from './components/Header';
import Reci from './components/Reci';
import BubbleText from './components/BubbleText';
import Box from './components/Box';
import About from './components/About';
import './App.css';


function App() {
  const [page, setPage] = useState('home');

  const navigateTo = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Header onNavigate={navigateTo} />
      {page === 'about' ? (
        <About />
      ) : (
        <>
          <Box />
          <BubbleText />
          <Reci />
        </>
      )}
    </>
  );
}

export default App;
