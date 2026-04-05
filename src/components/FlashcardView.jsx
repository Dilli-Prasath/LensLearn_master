import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Check, X, Layers, Shuffle, Award } from 'lucide-react';
import Button from '../lib/components/Button';
import Card from '../lib/components/Card';
import Badge from '../lib/components/Badge';
import Progress from '../lib/components/Progress';
import ProgressRing from '../lib/components/ProgressRing';
import EmptyState from '../lib/components/EmptyState';

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
        <EmptyState
          icon={<Layers size={48} />}
          title="No flashcards"
          description="No flashcards to display"
          className="fade-in"
        />
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
        <Card variant="elevated" style={styles.summary}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}>
            <div className="bounce-in">
              <Award size={48} color={allMastered ? '#f59e0b' : 'var(--primary-light)'} style={{ filter: allMastered ? 'drop-shadow(0 4px 12px rgba(245,158,11,0.4))' : 'none' }} />
            </div>
            <h2 style={styles.summaryTitle}>
              {allMastered ? 'Perfect Score!' : 'Session Complete!'}
            </h2>

            {/* Progress ring */}
            <ProgressRing
              value={percentMastered}
              size={100}
              color="var(--success)"
              showValue
            />

            {/* Stats Grid */}
            <div style={styles.statsGrid} className="stagger-children">
              <Card variant="outline" style={styles.statCard} className="hover-lift">
                <Card.Stat
                  label="Mastered"
                  value={masteredCards.size}
                  icon={<Check size={20} />}
                  color="var(--success)"
                />
              </Card>
              <Card variant="outline" style={styles.statCard} className="hover-lift">
                <Card.Stat
                  label="Review"
                  value={reviewCards.size}
                  icon={<RotateCw size={20} />}
                  color="var(--warning)"
                />
              </Card>
            </div>

            <p style={styles.summarySubtext}>
              {reviewCards.size > 0
                ? `Focus on the ${reviewCards.size} card${reviewCards.size !== 1 ? 's' : ''} marked for review.`
                : 'Great job reviewing all cards!'}
            </p>

            <div style={styles.summaryActions}>
              <Button
                variant="primary"
                icon={<RotateCw size={18} />}
                onClick={handleReset}
                fullWidth
              >
                Study Again
              </Button>
              <Button variant="secondary" onClick={onClose} fullWidth>
                Done
              </Button>
            </div>
          </div>
        </Card>
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
          <Badge variant="success" size="sm" icon={<Check size={12} />}>
            {masteredCards.size} mastered
          </Badge>
        </div>
        <Progress
          value={currentIndex + 1}
          max={flashcards.length}
          size="md"
        />
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
        <Button
          variant="secondary"
          size="sm"
          icon={<ChevronLeft size={18} />}
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          Prev
        </Button>
        <Button
          variant="secondary"
          size="sm"
          iconRight={<ChevronRight size={18} />}
          onClick={() => { setSlideDir(null); handleNext(); }}
          disabled={currentIndex >= flashcards.length - 1}
        >
          Next
        </Button>
      </div>

      {/* Mastery buttons */}
      <div style={styles.masteryButtons}>
        <Button
          variant={isReview ? 'warning' : 'outline'}
          icon={<X size={16} />}
          onClick={handleStudyAgain}
          fullWidth
          style={{ borderColor: 'var(--warning)', color: isReview ? 'white' : 'var(--warning)' }}
        >
          Study Again
        </Button>

        <Button
          variant={isMastered ? 'success' : 'primary'}
          icon={<Check size={16} />}
          onClick={handleKnowIt}
          fullWidth
        >
          {isMastered ? 'Got it!' : 'Know It'}
        </Button>
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

  // Progress
  progress: { display: 'flex', flexDirection: 'column', gap: 8 },
  progressInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardCounter: { display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 },
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

  // Summary
  summary: {
    padding: 24,
  },
  summaryTitle: { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, width: '100%', maxWidth: 280 },
  statCard: {
    padding: 16,
  },
  summarySubtext: { textAlign: 'center', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 14 },
  summaryActions: { display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 },
};
