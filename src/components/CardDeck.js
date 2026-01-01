import React from 'react';
import './CardDeck.css';
import { levelNames } from '../data/cardData';

const CardDeck = ({ level, onSelectDeck }) => {
  const renderLevelName = () => {
    const parts = levelNames[level].split(' - ');
    return (
      <div className="deck-label">
        {parts.map((part, index) => (
          <div key={index}>{part}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="deck-container" onClick={() => onSelectDeck(level)}>
      <div className="deck-stack">
        <div className="deck-card deck-card-3"></div>
        <div className="deck-card deck-card-2"></div>
        <div className="deck-card deck-card-1">
          <img
            src={process.env.PUBLIC_URL + `/level${level}.png`}
            alt={`Level ${level} deck`}
            className="deck-image"
          />
        </div>
      </div>
      {renderLevelName()}
    </div>
  );
};

export default CardDeck;
