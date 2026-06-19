import React from 'react';
import './Preloader.css';

const loadingBlocks = Array.from({ length: 10 }, (_, index) => index);

const Preloader = ({ progress }) => {
  const filledBlocks = Math.ceil(progress / 10);

  return (
  <main className="preloader" aria-label="Loading Reci">
    <div className="preloader-content">
      <h1 className="preloader-title">Reci</h1>
      <div
        className="preloader-bar"
        role="progressbar"
        aria-label="Loading homepage"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={progress}
      >
        {loadingBlocks.map((block) => (
          <span
            className={block < filledBlocks ? 'preloader-block preloader-block-filled' : 'preloader-block'}
            style={{ animationDelay: `${block * 140}ms` }}
            key={block}
          />
        ))}
      </div>
      <p className="preloader-progress">{progress}%</p>
    </div>
  </main>
  );
};

export default Preloader;
