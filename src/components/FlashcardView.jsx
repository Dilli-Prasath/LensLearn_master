import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Check, X, Layers, Shuffle, Award } from 'lucide-react';
import Button from '../lib/components/Button';
import Card from '../lib/components/Card';
import Badge from '../lib/components/Badge';
import Progress from '../lib/components/Progress';
import ProgressRing from '../lib/components/ProgressRing';
import EmptyState from '../lib/components/EmptyState';

/**
 * Normalize flashcard data from AI responses.
 * AI models may return varied field names and formats:
 *  - "front"/"back" (expected)
 *  - "question"/"answer"
 *  - "term"/"definition"
 *  - "prompt"/"response"
 *  - "q"/"a"
 *  - nested in extra wrapper
 * Also filters out empty/invalid cards.
 */
function normalizeFlashcards(raw) {
  if (!raw || !Array.isArray(raw)) return [];

  return raw
    .map(card => {
      if (!card || typeof card !== 'object') return null;

      // Try various field name combinations for front/back
      const front =
        card.front || card.question || card.term || card.prompt ||
        card.q || card.Front || card.Question || card.Term || '';
      const back =
        card.back || card.answer || card.definition || card.response ||
        card.a || card.Back || card.Answer || card.Definition ||
        card.explanation || card.Explanation || '';

      // Both sides must have content
      const frontStr = String(front).trim();
      const backStr = String(back).trim();
      if (!frontStr || !backStr) return null;

      return { front: frontStr, back: backStr };
    })
    .filter(Boolean);
}

/**
 * Fisher-Yates shuffle (immutable — returns new array)
 */
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function FlashcardView({ flashcards: rawFlashcards, onClose }) {
  const cards = useMemo(() => normalizeFlashcards(rawFlashcards), [rawFlashcards]);

  const [cardOrder, setCardOrder] = useState(() => cards.map((_, i) => i));
  const [currentStep, setCurrentStep] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState(new Set());
  const [reviewCards, setReviewCards] = useState(new Set());
  const [showSummary, setShowSummary] = useState(false);

  if (!cards.length) {
    return (
      <div style={styles.container}>
        <EmptyState
          icon={<Layers size={48} />}
          title="No flashcards"
          description="Could not generate flashcards. Try again with different content."
          className="fade-in"
        />
      </div>
    );
  }

  const currentCardIdx = cardOrder[currentStep];
  const currentCard = cards[currentCardIdx];
  const isMastered = masteredCards.has(currentCardIdx);
  const isReview = reviewCards.has(currentCardIdx);
  const percentMastered = Math.round((masteredCards.size / cards.length) * 100);

  const goToNext = () => {
    if (currentStep < cardOrder.length - 1) {
      setCurrentStep(s => s + 1);
      setIsFlipped(false);
    } else {
      setShowSummary(true);
    }
  };

  const goToPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
      setIsFlipped(false);
    }
  };

  const handleKnowIt = () => {
    const idx = currentCardIdx;
    setMasteredCards(prev => new Set([...prev, idx]));
    setReviewCards(prev => {
      const updated = new Set(prev);
      updated.delete(idx);
      return updated;
    });
    goToNext();
  };

  const handleStudyAgain = () => {
    const idx = currentCardIdx;
    setReviewCards(prev => new Set([...prev, idx]));
    setMasteredCards(prev => {
      const updated = new Set(prev);
      updated.delete(idx);
      return updated;
    });
    goToNext();
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsFlipped(false);
    setMasteredCards(new Set());
    setReviewCards(new Set());
    setShowSummary(false);
    setCardOrder(cards.map((_, i) => i));
  };

  const handleShuffle = () => {
    setCardOrder(shuffleArray(cards.map((_, i) => i)));
    setCurrentStep(0);
    setIsFlipped(false);
    setMasteredCards(new Set());
    setReviewCards(new Set());
    setShowSummary(false);
  };

  // ── Summary screen ──
  if (showSummary) {
    const allMastered = masteredCards.size === cards.length;
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

            <ProgressRing value={percentMastered} size={100} color="var(--success)" showValue />

            <div style={styles.statsGrid} className="stagger-children">
              <Card variant="outline" style={styles.statCard} className="hover-lift">
                <Card.Stat label="Mastered" value={masteredCards.size} icon={<Check size={20} />} color="var(--success)" />
              </Card>
              <Card variant="outline" style={styles.statCard} className="hover-lift">
                <Card.Stat label="Review" value={reviewCards.size} icon={<RotateCw size={20} />} color="var(--warning, #f59e0b)" />
              </Card>
            </div>

            <p style={styles.summarySubtext}>
              {reviewCards.size > 0
                ? `Focus on the ${reviewCards.size} card${reviewCards.size !== 1 ? 's' : ''} marked for review.`
                : 'Great job reviewing all cards!'}
            </p>

            <div style={styles.summaryActions}>
              <Button variant="primary" icon={<Shuffle size={18} />} onClick={handleShuffle} fullWidth>
                Shuffle & Retry
              </Button>
              <Button variant="secondary" icon={<RotateCw size={18} />} onClick={handleReset} fullWidth>
                Start Over
              </Button>
              <Button variant="ghost" onClick={onClose} fullWidth>
                Done
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── Main flashcard view ──
  return (
    <div style={styles.container}>
      {/* Progress bar + dots */}
      <div style={styles.progress} className="fade-in">
        <div style={styles.progressInfo}>
          <span style={styles.cardCounter}>
            <Layers size={14} style={{ marginRight: 4 }} />
            {currentStep + 1} / {cards.length}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Badge variant="success" size="sm" icon={<Check size={12} />}>
              {masteredCards.size}
            </Badge>
            {reviewCards.size > 0 && (
              <Badge variant="warning" size="sm" icon={<RotateCw size={12} />}>
                {reviewCards.size}
              </Badge>
            )}
          </div>
        </div>
        <Progress value={currentStep + 1} max={cards.length} size="md" />
        <div style={styles.cardDots}>
          {cards.map((_, i) => {
            const orderIdx = cardOrder.indexOf(i);
            return (
              <div key={i} style={{
                ...styles.cardDot,
                background: orderIdx === currentStep ? 'var(--primary-light)'
                  : masteredCards.has(i) ? 'var(--success, #10b981)'
                  : reviewCards.has(i) ? 'var(--warning, #f59e0b)'
                  : 'var(--border)',
                transform: orderIdx === currentStep ? 'scale(1.4)' : 'scale(1)',
              }} />
            );
          })}
        </div>
      </div>

      {/* Flashcard */}
      <div style={styles.cardContainer}>
        <div
          style={{
            ...styles.flashcard,
            borderColor: isMastered ? 'var(--success, #10b981)'
              : isReview ? 'var(--warning, #f59e0b)'
              : 'var(--border)',
          }}
          onClick={() => setIsFlipped(!isFlipped)}
          role="button"
          tabIndex={0}
          aria-label={isFlipped ? 'Answer side. Tap to flip.' : 'Question side. Tap to reveal answer.'}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsFlipped(!isFlipped); } }}
        >
          {/* Front face */}
          <div style={{
            ...styles.cardFace,
            opacity: isFlipped ? 0 : 1,
            pointerEvents: isFlipped ? 'none' : 'auto',
            transform: isFlipped ? 'scale(0.95)' : 'scale(1)',
          }}>
            <div style={styles.cardLabel}>Question</div>
            <div style={styles.cardContent}>{currentCard.front}</div>
            <div style={styles.tapHint}>
              <RotateCw size={12} style={{ marginRight: 4 }} />
              Tap to reveal answer
            </div>
          </div>

          {/* Back face */}
          <div style={{
            ...styles.cardFace,
            opacity: isFlipped ? 1 : 0,
            pointerEvents: isFlipped ? 'auto' : 'none',
            transform: isFlipped ? 'scale(1)' : 'scale(0.95)',
          }}>
            <div style={{ ...styles.cardLabel, color: 'var(--primary-light)' }}>Answer</div>
            <div style={styles.cardContent}>{currentCard.back}</div>
            <div style={styles.tapHint}>
              <RotateCw size={12} style={{ marginRight: 4 }} />
              Tap to flip back
            </div>
          </div>
        </div>
      </div>

      {/* Navigation row */}
      <div style={styles.navigation}>
        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronLeft size={18} />}
          onClick={goToPrev}
          disabled={currentStep === 0}
        >
          Prev
        </Button>

        <Button
          variant="ghost"
          size="sm"
          icon={<Shuffle size={16} />}
          onClick={handleShuffle}
        >
          Shuffle
        </Button>

        <Button
          variant="ghost"
          size="sm"
          iconRight={<ChevronRight size={18} />}
          onClick={() => goToNext()}
          disabled={currentStep >= cardOrder.length - 1}
        >
          Skip
        </Button>
      </div>

      {/* Mastery buttons — only show when card is flipped */}
      {isFlipped && (
        <div style={styles.masteryButtons} className="fade-in">
          <Button
            variant={isReview ? 'warning' : 'outline'}
            icon={<X size={16} />}
            onClick={handleStudyAgain}
            fullWidth
            style={!isReview ? { borderColor: 'var(--warning, #f59e0b)', color: 'var(--warning, #f59e0b)' } : undefined}
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
      )}

      {/* Hint when not flipped */}
      {!isFlipped && (
        <div style={styles.flipHint} className="fade-in">
          Tap the card to reveal the answer, then rate yourself
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
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
    minHeight: 240,
  },
  flashcard: {
    width: '100%', maxWidth: 400, minHeight: 240,
    background: 'var(--bg-card)', border: '2px solid var(--border)',
    borderRadius: 'var(--radius, 16px)', cursor: 'pointer',
    position: 'relative',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
  },
  cardFace: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: 24, textAlign: 'center',
    transition: 'opacity 0.35s ease, transform 0.35s ease',
  },
  cardLabel: {
    fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase',
    letterSpacing: 1.5, marginBottom: 14, fontWeight: 700,
  },
  cardContent: {
    fontSize: 17, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 16,
    fontWeight: 500, wordBreak: 'break-word', maxHeight: 140, overflowY: 'auto',
  },
  tapHint: {
    display: 'flex', alignItems: 'center',
    fontSize: 11, color: 'var(--text-muted)', marginTop: 'auto',
  },

  // Navigation
  navigation: { display: 'flex', gap: 8, justifyContent: 'center' },
  masteryButtons: { display: 'flex', gap: 12, justifyContent: 'center' },

  // Flip hint
  flipHint: {
    textAlign: 'center', fontSize: 12, color: 'var(--text-muted)',
    fontStyle: 'italic', padding: '8px 0',
  },

  // Summary
  summary: { padding: 24 },
  summaryTitle: { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, width: '100%', maxWidth: 280 },
  statCard: { padding: 16 },
  summarySubtext: { textAlign: 'center', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 14 },
  summaryActions: { display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 },
};
