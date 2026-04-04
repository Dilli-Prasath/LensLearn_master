import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Check, X, Layers, Shuffle, Award } from 'lucide-react';

export default function FlashcardView({ flashcards, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState(new Set());
  const [reviewCards, setReviewCards] = useState(new Set());
  const [showSummary, setShowSummary] = useState(false);
  const [slideDir, setSlideDir] = useState(null); // 'left' or 'right' for transition

  if (!flashcards || flashcards.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState} className="fade-in">
          <Layers size={48} color="var(--text-muted)" />
          <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>No flashcards to display</p>
        </div>
      </div>
    );
  }

  const handleKnowIt = () => {
    const id = currentIndex;
    setMasteredCards(prev => new Set([...prev, id]));
    setReviewCards(prev => {
      const updated = new Set(prev);
      updated.delete(id);
      return updated;
    });
    setSlideDir('right');
    handleNext();
  };

  const handleStudyAgain = () => {
    const id = currentIndex;
    setReviewCards(prev => new Set([...prev, id]));
    setMasteredCards(prev => {
      const updated = new Set(prev);
      updated.delete(id);
      return updated;
    });
    setSlideDir('left');
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
      setSlideDir(null);
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
    setSlideDir(null);
  };

  const handleShuffle = () => {
    // Visual feedback only — user can restudy in random order on reset
    setCurrentIndex(0);
    setIsFlipped(false);
    setSlideDir(null);
  };

  const currentCard = flashcards[currentIndex];
  const percentMastered = Math.round((masteredCards.size / flashcards.length) * 100);
  const percentReview = Math.round((reviewCards.size / flashcards.length) * 100);
  const isMastered = masteredCards.has(currentIndex);
  const isReview = reviewCards.has(currentIndex);

  if (showSummary) {
    const allMastered = masteredCards.size === flashcards.length;

    return (
      <div style={styles.container} className="fade-in">
        <div style={styles.summary}>
          <div className="bounce-in">
            <Award size={48} color={allMastered ? '#f59e0b' : 'var(--primary-light)'} style={{ filter: allMastered ? 'drop-shadow(0 4px 12px rgba(245,158,11,0.4))' : 'none' }} />
          </div>
          <h2 style={styles.summaryTitle}>
            {allMastered ? 'Perfect Score!' : 'Session Complete!'}
          </h2>

          {/* Visual score ring */}
          <div style={{ position: 'relative', width: 100, height: 100 }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="5" />
              <circle
                cx="50" cy="50" r="42"
                fill="none" stroke="var(--success)" strokeWidth="5"
                strokeDasharray={`${263.9 * (percentMastered / 100)} 263.9`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dasharray 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{percentMastered}%</div>
            </div>
          </div>

          <div style={styles.statsGrid} className="stagger-children">
            <div style={{ ...styles.statCard, borderColor: 'var(--success)' }} className="hover-lift">
              <Check size={20} color="var(--success)" />
              <div style={styles.statNumber}>{masteredCards.size}</div>
              <div style={styles.statLabel}>Mastered</div>
            </div>
            <div style={{ ...styles.statCard, borderColor: 'var(--warning)' }} className="hover-lift">
              <RotateCw size={20} color="var(--warning)" />
              <div style={styles.statNumber}>{reviewCards.size}</div>
              <div style={styles.statLabel}>Review</div>
            </div>
          </div>

          <p style={styles.summarySubtext}>
            {reviewCards.size > 0
              ? `Focus on the ${reviewCards.size} card${reviewCards.size !== 1 ? 's' : ''} marked for review.`
              : 'Great job reviewing all cards!'}
          </p>

          <div style={styles.summaryActions}>
            <button className="btn btn-primary" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' }}>
              <RotateCw size={18} />
              Study Again
            </button>
            <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%' }}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Progress with dots */}
      <div style={styles.progress} className="fade-in">
        <div style={styles.progressInfo}>
          <span style={styles.cardCounter}>
            <Layers size={14} style={{ marginRight: 4 }} />
            {currentIndex + 1} / {flashcards.length}
          </span>
          <span style={styles.masteredBadge}>
            <Check size={12} style={{ marginRight: 3 }} />
            {masteredCards.size} mastered
          </span>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${((currentIndex + 1) / flashcards.length) * 100}%` }} />
        </div>
        {/* Card dots */}
        <div style={styles.cardDots}>
          {flashcards.map((_, i) => (
            <div key={i} style={{
              ...styles.cardDot,
              background: i === currentIndex ? 'var(--primary-light)'
                : masteredCards.has(i) ? 'var(--success)'
                : reviewCards.has(i) ? 'var(--warning)'
                : 'var(--border)',
              transform: i === currentIndex ? 'scale(1.3)' : 'scale(1)',
            }} />
          ))}
        </div>
      </div>

      {/* Flashcard */}
      <div style={styles.cardContainer}>
        <div
          style={{
            ...styles.flashcard,
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            borderColor: isMastered ? 'var(--success)' : isReview ? 'var(--warning)' : 'var(--border)',
          }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front face */}
          <div style={{ ...styles.cardFace, opacity: isFlipped ? 0 : 1, pointerEvents: isFlipped ? 'none' : 'auto' }}>
            <div style={styles.cardLabel}>Question</div>
            <div style={styles.cardContent}>{currentCard.front}</div>
            <div style={styles.tapHint}>
              <RotateCw size={12} style={{ marginRight: 4 }} />
              Tap to reveal
            </div>
          </div>
          {/* Back face (shown when flipped — we fake it since CSS 3D is tricky in inline) */}
          <div style={{ ...styles.cardFace, ...styles.cardFaceBack, opacity: isFlipped ? 1 : 0, pointerEvents: isFlipped ? 'auto' : 'none' }}>
            <div style={{ ...styles.cardLabel, color: 'var(--primary-light)' }}>Answer</div>
            <div style={styles.cardContent}>{currentCard.back}</div>
            <div style={styles.tapHint}>
              <RotateCw size={12} style={{ marginRight: 4 }} />
              Tap to flip back
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={styles.navigation}>
        <button
          className="btn btn-secondary"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{ opacity: currentIndex === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px' }}
        >
          <ChevronLeft size={18} />
          Prev
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => { setSlideDir(null); handleNext(); }}
          disabled={currentIndex >= flashcards.length - 1}
          style={{ opacity: currentIndex >= flashcards.length - 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px' }}
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Mastery buttons */}
      <div style={styles.masteryButtons}>
        <button
          style={{
            ...styles.studyAgainBtn,
            background: isReview ? 'var(--warning)' : 'transparent',
            color: isReview ? 'white' : 'var(--warning)',
            borderColor: 'var(--warning)',
          }}
          onClick={handleStudyAgain}
        >
          <X size={16} />
          Study Again
        </button>

        <button
          style={{
            ...styles.knowItBtn,
            background: isMastered ? 'var(--success)' : 'var(--primary)',
          }}
          onClick={handleKnowIt}
        >
          <Check size={16} />
          {isMastered ? 'Got it!' : 'Know It'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 16,
    height: '100%',
    overflowY: 'auto',
  },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: 40, textAlign: 'center',
  },

  // Progress
  progress: { display: 'flex', flexDirection: 'column', gap: 8 },
  progressInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardCounter: { display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 },
  masteredBadge: {
    display: 'flex', alignItems: 'center',
    background: 'rgba(16,185,129,0.15)', color: 'var(--success)',
    padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
  },
  progressBar: { height: 4, background: 'var(--bg-card)', borderRadius: 2, overflow: 'hidden' },
  progressFill: {
    height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))',
    transition: 'width 0.4s ease',
  },
  cardDots: {
    display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap',
  },
  cardDot: {
    width: 8, height: 8, borderRadius: '50%',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Card
  cardContainer: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: 260, perspective: '1000px',
  },
  flashcard: {
    width: '100%', maxWidth: 400, height: 260,
    background: 'var(--bg-card)', border: '2px solid var(--border)',
    borderRadius: 'var(--radius)', cursor: 'pointer',
    position: 'relative',
    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s',
    transformStyle: 'preserve-3d',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  },
  cardFace: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: 24, textAlign: 'center',
    transition: 'opacity 0.3s ease',
  },
  cardFaceBack: {},
  cardLabel: {
    fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase',
    letterSpacing: 1.5, marginBottom: 14, fontWeight: 700,
  },
  cardContent: {
    fontSize: 18, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 16,
    fontWeight: 500,
  },
  tapHint: {
    display: 'flex', alignItems: 'center',
    fontSize: 11, color: 'var(--text-muted)', marginTop: 'auto',
  },

  // Navigation
  navigation: { display: 'flex', gap: 12, justifyContent: 'center' },
  masteryButtons: { display: 'flex', gap: 12, justifyContent: 'center' },
  studyAgainBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '12px 20px', fontSize: 14, fontWeight: 600,
    borderRadius: 'var(--radius)', border: '2px solid',
    cursor: 'pointer', transition: 'all 0.25s',
  },
  knowItBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '12px 20px', fontSize: 14, fontWeight: 600,
    color: 'white', borderRadius: 'var(--radius)', border: 'none',
    cursor: 'pointer', transition: 'all 0.25s',
  },

  // Summary
  summary: {
    display: 'flex', flexDirection: 'column', gap: 20,
    alignItems: 'center', padding: 24,
  },
  summaryTitle: { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, width: '100%', maxWidth: 280 },
  statCard: {
    background: 'var(--bg-card)', border: '2px solid',
    borderRadius: 'var(--radius)', padding: 16,
    textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
  },
  statNumber: { fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' },
  statLabel: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  summarySubtext: { textAlign: 'center', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 14 },
  summaryActions: { display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 },
};
