import React, { useState, useEffect, useRef } from 'react';
import CardDeck from './CardDeck';
import Card from './Card';
import { cardData } from '../data/cardData';
import './CardGame.css';

const CardGame = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [drawnCard, setDrawnCard] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [usedCards, setUsedCards] = useState({ 0: [], 1: [], 2: [], 3: [] });
  const [showTransition, setShowTransition] = useState(false);
  const [cardIndex, setCardIndex] = useState(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioRef = useRef(null);

  const handleSelectDeck = (level) => {
    const availableCards = cardData[level].filter(
      (_, index) => !usedCards[level].includes(index)
    );

    if (availableCards.length === 0) {
      alert('這個牌堆的卡片已經抽完了！');
      return;
    }

    setSelectedLevel(level);
    setShowTransition(true);
  };

  useEffect(() => {
    // Preload audio
    const audio = new Audio('/poker.mp3');
    audioRef.current = audio;

    const handleCanPlayThrough = () => {
      setAudioLoaded(true);
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.load();

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, []);

  useEffect(() => {
    if (showTransition && selectedLevel !== null) {
      const timer = setTimeout(() => {
        setShowTransition(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [showTransition, selectedLevel]);

  const handleFlip = () => {
    // Play sound effect
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }

    if (!isFlipped && drawnCard === null) {
      // First flip - draw the card
      const availableCards = cardData[selectedLevel].filter(
        (_, index) => !usedCards[selectedLevel].includes(index)
      );
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      const originalIndex = cardData[selectedLevel].indexOf(availableCards[randomIndex]);

      setDrawnCard(availableCards[randomIndex]);
      setCardIndex(originalIndex);
      setUsedCards(prev => ({
        ...prev,
        [selectedLevel]: [...prev[selectedLevel], originalIndex]
      }));
    }
    setIsFlipped(!isFlipped);
  };

  const handleReset = () => {
    setSelectedLevel(null);
    setDrawnCard(null);
    setIsFlipped(false);
    setShowTransition(false);
    setCardIndex(null);
  };

  const handleDrawNext = () => {
    const availableCards = cardData[selectedLevel].filter(
      (_, index) => !usedCards[selectedLevel].includes(index)
    );

    if (availableCards.length === 0) {
      alert('這個牌堆的卡片已經抽完了！');
      return;
    }

    // Reset to card back state
    setDrawnCard(null);
    setIsFlipped(false);
  };

  const handleResetAll = () => {
    setUsedCards({ 0: [], 1: [], 2: [], 3: [] });
    setSelectedLevel(null);
    setDrawnCard(null);
    setIsFlipped(false);
    setShowTransition(false);
    setCardIndex(null);
  };

  if (!audioLoaded) {
    return (
      <div className="card-game">
        <div className="loading-screen">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-game">
      <h1 className="game-title">深度地認識一個人</h1>

      {selectedLevel === null ? (
        <div className="deck-selection">
          <h2 className="selection-title">選擇一個牌堆</h2>
          <div className="decks-container">
            {[0, 1, 2, 3].map(level => (
              <CardDeck
                key={level}
                level={level}
                onSelectDeck={handleSelectDeck}
              />
            ))}
          </div>
          <button className="reset-all-button" onClick={handleResetAll}>
            重置所有牌堆
          </button>
        </div>
      ) : showTransition ? (
        <div className="transition-screen">
          <div className="card-flying">
            <img
              src={`/level${selectedLevel}.png`}
              alt="flying card"
              className="flying-card-img"
            />
          </div>
        </div>
      ) : (
        <div className="card-display">
          <button className="back-button" onClick={handleReset}>
            ← 返回選擇牌堆
          </button>
          <Card
            level={selectedLevel}
            content={drawnCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
          />
          <div className="button-group">
            {!isFlipped && drawnCard === null && (
              <button className="action-button secondary" onClick={handleFlip}>
                翻開卡片
              </button>
            )}
            {isFlipped && drawnCard !== null && (
              <button className="action-button secondary" onClick={handleDrawNext}>
                抽下一張牌
              </button>
            )}
          </div>
          {drawnCard && (
            <div className="card-info">
              <p>剩餘卡片: {cardData[selectedLevel].length - usedCards[selectedLevel].length} / {cardData[selectedLevel].length}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardGame;
