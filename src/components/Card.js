import React from 'react';
import './Card.css';
import { levelNames } from '../data/cardData';

const Card = ({ level, content, isFlipped, onFlip, isDrawingNext }) => {
  const renderLevelName = () => {
    const parts = levelNames[level].split(' - ');
    return (
      <div className="card-level-name">
        {parts.map((part, index) => (
          <div key={index}>{part}</div>
        ))}
      </div>
    );
  };

  const renderStars = () => {
    if (level === 0) {
      return <div className="card-stars">☆</div>;
    }

    const stars = '★'.repeat(level);
    return <div className="card-stars">{stars}</div>;
  };

  return (
    <div className={`card-container ${isFlipped ? 'flipped' : ''} ${isDrawingNext ? 'drawing-next' : ''}`} onClick={onFlip}>
      <div className="card">
        <div className="card-front">
          <img
            src={process.env.PUBLIC_URL + `/level${level}.png`}
            alt={`Level ${level} card back`}
            className="card-image"
          />
        </div>
        <div className="card-back">
          <div className="card-content">
            {renderStars()}
            <div className="card-text">{content}</div>
          </div>
          {renderLevelName()}
        </div>
      </div>
    </div>
  );
};

export default Card;
