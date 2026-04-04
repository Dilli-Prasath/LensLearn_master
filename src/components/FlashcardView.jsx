import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

export default function FlashcardView({ flashcards, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState(new Set());
  const [reviewCards, setReviewCards] = useState(new Set());
  const [showSummary, setShowSummary] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <p>No flashcards to display</p>
        </div>
      </div>
    );
  }

  const handleKnowIt = () => {
    const id = currentIndex;
    setMasteredCards(new Set([...masteredCards, id]));
    setReviewCards(reviewCards => {
      const updated = new Set(reviewCards);
      updated.delete(id);
      return updated;
    });
    handleNext();
  };

  const handleStudyAgain = () => {
    const id = currentIndex;
    setReviewCards(new Set([...reviewCards, id]));
    setMasteredCards(masteredCards => {
      const updated = new Set(masteredCards);
      updated.delete(id);
      return updated;
    });
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredCards(new Set());
    setReviewCards(new Set());
    setShowSummary(false);
  };

  const currentCard = flashcards[currentIndex];
  const percentMastered = Math.round((masteredCards.size / flashcards.length) * 100);
  const percentReview = Math.round((reviewCards.size / flashcards.length) * 100);

  if (showSummary) {
    return (
      <div style={styles.container} className="slide-up">
        <div style={styles.summary}>
          <h2 style={styles.summaryTitle}>Study Session Complete!</h2>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{masteredCards.size}</div>
              <div style={styles.statLabel}>Mastered</div>
              <div style={styles.statPercent}>{percentMastered}%</div>
            </div>

            <div style={{...styles.statCard, borderColor: 'var(--warning)'}}>
              <div style={styles.statNumber}>{reviewCards.size}</div>
              <div style={styles.statLabel}>Review Again</div>
              <div style={styles.statPercent}>{percentReview}%</div>
            </div>
          </div>

          <div style={styles.summaryText}>
            <p>Great effort! You reviewed <strong>{flashcards.length}</strong> flashcards.</p>
            {masteredCards.size === flashcards.length && (
              <p style={{ color: 'var(--success)', marginTop: 12 }}>You mastered everything! 🎉</p>
            )}
            {reviewCards.size > 0 && (
              <p style={{ marginTop: 8 }}>Focus on the {reviewCards.size} cards marked for review.</p>
            )}
          </div>

          <div style={styles.summaryActions}>
            <button
              className="btn btn-primary"
              onClick={handleReset}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <RotateCw size={18} />
              Study Again
            </button>
            <button
              className="btn btn-secondary"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} className="slide-up">
      {/* Progress */}
      <div style={styles.progress}>
        <div style={styles.progressInfo}>
          <span style={styles.cardCounter}>
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <span style={styles.masteredBadge}>
            {masteredCards.size} mastered
          </span>
        </div>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div style={styles.cardContainer}>
        <div
          style={{
            ...styles.flashcard,
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div style={styles.cardFace} data-side="front">
            <div style={styles.cardLabel}>{isFlipped ? 'Answer' : 'Question'}</div>
            <div style={styles.cardContent}>
              {isFlipped ? currentCard.back : currentCard.front}
            </div>
            <div style={styles.tapHint}>Tap to flip</div>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div style={styles.navigation}>
        <button
          className="btn btn-secondary"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{
            opacity: currentIndex === 0 ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          style={{
            opacity: currentIndex === flashcards.length - 1 ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Mastery buttons */}
      <div style={styles.masteryButtons}>
        <button
          className="btn"
          style={{
            ...styles.studyAgainBtn,
            backgroundColor: reviewCards.has(currentIndex) ? 'var(--warning)' : 'var(--bg-card)',
            color: reviewCards.has(currentIndex) ? 'white' : 'var(--text-primary)',
            border: reviewCards.has(currentIndex) ? 'none' : '2px solid var(--warning)',
          }}
          onClick={handleStudyAgain}
        >
          Study Again
        </button>

        <button
          className="btn btn-primary"
          style={{
            ...styles.knowItBtn,
            opacity: masteredCards.has(currentIndex) ? 1 : 0.7,
            backgroundColor: masteredCards.has(currentIndex) ? 'var(--success)' : 'var(--primary)',
          }}
          onClick={handleKnowIt}
        >
          {masteredCards.has(currentIndex) ? '✓ Got it!' : 'Know It'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    padding: 16,
    height: '100%',
    overflowY: 'auto',
  },
  progress: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 13,
  },
  cardCounter: {
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  masteredBadge: {
    background: 'var(--success)',
    color: 'white',
    padding: '4px 12px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  progressBar: {
    height: 6,
    background: 'var(--bg-card)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--primary), var(--accent))',
    transition: 'width 0.3s ease',
  },
  cardContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    perspective: '1000px',
  },
  flashcard: {
    width: '100%',
    maxWidth: 400,
    height: 280,
    background: 'var(--bg-card)',
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.6s ease',
    transformStyle: 'preserve-3d',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  cardFace: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    textAlign: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    fontWeight: 600,
  },
  cardContent: {
    fontSize: 18,
    color: 'var(--text-primary)',
    lineHeight: 1.6,
    marginBottom: 20,
  },
  tapHint: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginTop: 'auto',
  },
  navigation: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
  },
  masteryButtons: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 10,
  },
  studyAgainBtn: {
    flex: 1,
    padding: '12px 20px',
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 'var(--radius)',
    border: '2px solid var(--warning)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  knowItBtn: {
    flex: 1,
    padding: '12px 20px',
    fontSize: 14,
    fontWeight: 600,
    color: 'white',
    borderRadius: 'var(--radius)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  summary: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    alignItems: 'center',
    padding: 20,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    width: '100%',
    maxWidth: 300,
  },
  statCard: {
    background: 'var(--bg-card)',
    border: '2px solid var(--success)',
    borderRadius: 'var(--radius)',
    padding: 16,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 700,
    color: 'var(--primary)',
  },
  statLabel: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  statPercent: {
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  summaryText: {
    textAlign: 'center',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  summaryActions: {
    display: 'flex',
    gap: 12,
    width: '100%',
    maxWidth: 300,
    flexDirection: 'column',
  },
};
