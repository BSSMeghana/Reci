// src/App.js
import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Reci from './components/Reci';
import BubbleText from './components/BubbleText';
import Box from './components/Box';
import About from './components/About';
import FloatingEmail from './components/FloatingEmail';
import Preloader from './components/Preloader';
import './App.css';

const HOME_ASSETS = [
  '/rec2.gif',
  '/rec1.gif',
  '/rec3.gif',
  '/rec4.gif',
  '/rec21.gif',
  '/rec11.gif',
];

const preloadAsset = (assetPath) => {
  if (assetPath.endsWith('.gif')) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = resolve;
      image.src = assetPath;
    });
  }

  return fetch(assetPath, { cache: 'force-cache' }).catch(() => null);
};

function App() {
  const [page, setPage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(15);

  useEffect(() => {
    let isMounted = true;
    let progressIntervalId;
    let finishTimeoutId;
    const minimumLoadTime = new Promise((resolve) => setTimeout(resolve, 2200));
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();

    progressIntervalId = setInterval(() => {
      setLoadingProgress((currentProgress) => {
        if (currentProgress >= 80) {
          return currentProgress;
        }

        return Math.min(currentProgress + 5, 80);
      });
    }, 160);

    Promise.all([
      minimumLoadTime,
      fontsReady,
      Promise.all(HOME_ASSETS.map(preloadAsset)),
    ]).finally(() => {
      if (isMounted) {
        setLoadingProgress(100);
        finishTimeoutId = setTimeout(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        }, 350);
      }
    });

    return () => {
      isMounted = false;
      clearInterval(progressIntervalId);
      clearTimeout(finishTimeoutId);
    };
  }, []);

  const navigateTo = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className={isLoading ? 'app-shell app-shell-loading' : 'app-shell'}>
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
        <FloatingEmail />
      </div>
      {isLoading && <Preloader progress={loadingProgress} />}
    </>
  );
}

export default App;
