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
  const [musicLoaded, setMusicLoaded] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const audioRef = useRef(null);
  const musicRef = useRef(null);
  const loadStartTime = useRef(Date.now());

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
    // Preload flip sound
    const audio = new Audio(process.env.PUBLIC_URL + '/poker.mp3');
    audioRef.current = audio;

    const handleCanPlayThrough = () => {
      setAudioLoaded(true);
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.load();

    // Preload background music
    const music = new Audio(process.env.PUBLIC_URL + '/music.mp3');
    music.loop = true;
    musicRef.current = music;

    const handleMusicCanPlayThrough = () => {
      setMusicLoaded(true);
    };

    music.addEventListener('canplaythrough', handleMusicCanPlayThrough);
    music.load();

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      music.removeEventListener('canplaythrough', handleMusicCanPlayThrough);
    };
  }, []);

  useEffect(() => {
    // Ensure minimum 3 second loading time
    if (audioLoaded && musicLoaded) {
      const elapsed = Date.now() - loadStartTime.current;
      const remaining = Math.max(0, 3000 - elapsed);

      setTimeout(() => {
        setLoadingComplete(true);
      }, remaining);
    }
  }, [audioLoaded, musicLoaded]);

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
      // All cards drawn, show shuffle animation and reset
      setShowTransition(true);
      setTimeout(() => {
        setUsedCards(prev => ({
          ...prev,
          [selectedLevel]: []
        }));
        setShowTransition(false);
        setDrawnCard(null);
        setIsFlipped(false);
      }, 1500);
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

  const toggleMusic = () => {
    if (musicRef.current) {
      if (isMusicPlaying) {
        musicRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        musicRef.current.play().catch(err => console.log('Music play failed:', err));
        setIsMusicPlaying(true);
      }
    }
  };

  if (!loadingComplete) {
    return (
      <div className="card-game">
        <div className="loading-screen">
          <div className="loading-cover">
            <img
              src={process.env.PUBLIC_URL + '/cover.jpg'}
              alt="Loading"
              className="cover-image"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-game">
      <button className="music-toggle" onClick={toggleMusic}>
        {isMusicPlaying ? '🔊' : '🔇'}
      </button>
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
          <div className={`card-flying ${drawnCard !== null ? 'shuffle-animation' : ''}`}>
            <img
              src={process.env.PUBLIC_URL + `/level${selectedLevel}.png`}
              alt="flying card"
              className="flying-card-img"
            />
          </div>
          {drawnCard !== null && (
            <p className="transition-text shuffle-text">洗牌中...</p>
          )}
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
        </div>
      )}
    </div>
  );
};

export default CardGame;
