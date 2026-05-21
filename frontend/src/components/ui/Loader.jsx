import React from 'react';
import './Loader.css';

const Loader = ({ size = 'md', color = '#6366f1' }) => {
  return (
    <div className={`loader-container`}>
      <div 
        className={`loader size-${size}`} 
        style={{ borderTopColor: color }}
      ></div>
    </div>
  );
};

export default Loader;
