import { useState, useCallback, useMemo } from 'react';
import { CheckCircle, XCircle, ArrowRight, Trophy, RotateCcw, Zap, Target, Star } from 'lucide-react';
import Button from '../lib/components/Button';
import Card from '../lib/components/Card';
import Badge from '../lib/components/Badge';
import Progress from '../lib/components/Progress';
import ScoreRing from '../lib/components/ScoreRing';
import { useScanStore } from '../store';

/**
 * Normalize quiz questions from AI responses.
 * AI models return varied formats — this handles all common cases:
 *  - correct: "A", "A)", "A.", "a", "A) Full text", full option text, index number
 *  - options: "A) text", "A. text", "1) text", or plain text without prefixes
 *
 * After normalization every question has:
 *  - options: ["A) text", "B) text", ...] with guaranteed letter prefixes
 *  - correct: single uppercase letter "A", "B", "C", or "D"
 */
function normalizeQuestions(rawQuestions) {
  if (!rawQuestions?.length) return [];
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  return rawQuestions.map(q => {
    // 1. Normalize options — ensure each has a letter prefix
    const options = (q.options || []).map((opt, i) => {
      const s = String(opt).trim();
      // Check if option already starts with a letter/number prefix like "A)" "A." "1)"
      if (/^[A-Fa-f][).:\s]/.test(s) || /^\d[).:\s]/.test(s)) {
        // Re-prefix with canonical letter to standardize
        const text = s.replace(/^[A-Fa-f0-9][).:\s]+\s*/, '');
        return `${LETTERS[i]}) ${text}`;
      }
      // No prefix — add one
      return `${LETTERS[i]}) ${s}`;
    });

    // 2. Normalize correct answer to a single uppercase letter
    let correct = 'A'; // fallback
    const raw = String(q.correct ?? '').trim();

    if (raw.length === 0) {
      correct = 'A';
    } else if (typeof q.correct === 'number') {
      // Numeric index — LLMs typically use 1-based (1=A, 2=B, etc.)
      // but could be 0-based. If value >= options.length, treat as 1-based.
      const idx = q.correct >= 1 ? q.correct - 1 : q.correct;
      correct = LETTERS[Math.max(0, Math.min(idx, options.length - 1))] || 'A';
    } else if (/^[A-Fa-f]$/.test(raw)) {
      // Single letter like "A" or "a"
      correct = raw.toUpperCase();
    } else if (/^[A-Fa-f][).:\s]/.test(raw)) {
      // Letter with delimiter like "A)" or "A." or "A) Full text"
      correct = raw.charAt(0).toUpperCase();
    } else if (/^\d$/.test(raw)) {
      // Single digit like "1"
      const idx = parseInt(raw, 10);
      correct = LETTERS[Math.min(idx <= 0 ? 0 : idx - 1, options.length - 1)] || 'A';
    } else {
      // Full option text match — find which option it matches
      const lowerRaw = raw.toLowerCase();
      const matchIdx = options.findIndex(opt => {
        const optText = opt.replace(/^[A-F][)]\s*/, '').toLowerCase();
        return optText === lowerRaw || opt.toLowerCase() === lowerRaw;
      });
      if (matchIdx >= 0) {
        correct = LETTERS[matchIdx];
      } else {
        // Partial match — check if correct text is contained in any option
        const partialIdx = options.findIndex(opt => opt.toLowerCase().includes(lowerRaw));
        if (partialIdx >= 0) {
          correct = LETTERS[partialIdx];
        } else {
          // Last resort: try matching against original options before normalization
          const origIdx = (q.options || []).findIndex(opt =>
            String(opt).toLowerCase().includes(lowerRaw) || lowerRaw.includes(String(opt).toLowerCase())
          );
          correct = origIdx >= 0 ? LETTERS[origIdx] : 'A';
        }
      }
    }

    return {
      ...q,
      options,
      correct,
    };
  });
}

export default function QuizView({ quiz, onClose, onRetry }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showCorrectFlash, setShowCorrectFlash] = useState(false);
  const [showWrongShake, setShowWrongShake] = useState(false);

  const questions = useMemo(() => normalizeQuestions(quiz?.questions), [quiz]);
  if (!questions.length) return null;

  const question = questions[currentQ];
  const isCorrect = selected === question.correct;

  /**
   * Write userAnswer back onto the quiz in the scan store so that
   * when the session is saved to history, each question has the
   * userAnswer field for score calculation.
   */
  const syncAnswerToStore = useCallback((questionIndex, answerLetter) => {
    try {
      const storeQuiz = useScanStore.getState().quiz;
      if (storeQuiz?.questions?.[questionIndex]) {
        const updatedQuestions = [...storeQuiz.questions];
        updatedQuestions[questionIndex] = {
          ...updatedQuestions[questionIndex],
          userAnswer: answerLetter,
        };
        useScanStore.setState({ quiz: { ...storeQuiz, questions: updatedQuestions } });
      }
    } catch { /* non-critical — history stats may be off but quiz still works */ }
  }, []);

  const handleSelect = (option) => {
    if (showResult) return;
    const letter = option.charAt(0).toUpperCase();
    setSelected(letter);
    setShowResult(true);

    // Sync to store for history persistence
    syncAnswerToStore(currentQ, letter);

    if (letter === question.correct) {
      setScore(s => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      setShowCorrectFlash(true);
      setTimeout(() => setShowCorrectFlash(false), 600);
    } else {
      setStreak(0);
      setShowWrongShake(true);
      setTimeout(() => setShowWrongShake(false), 500);
    }
    setAnswers(prev => [...prev, { selected: letter, correct: question.correct }]);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    const emoji = percentage >= 80 ? 'Excellent!' : percentage >= 50 ? 'Good effort!' : 'Keep practicing!';
    const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 40 ? 1 : 0;

    return (
      <div style={styles.container} className="fade-in">
        {/* Celebration header */}
        <div style={styles.celebrationBg}>
          <div style={styles.confettiDots}>
            {[...Array(12)].map((_, i) => (
              <span key={i} style={{
                ...styles.confettiDot,
                left: `${8 + (i * 8)}%`,
                animationDelay: `${i * 0.15}s`,
                background: ['var(--primary)', 'var(--accent)', 'var(--success)', '#f59e0b'][i % 4],
              }} />
            ))}
          </div>
        </div>

        <Card variant="elevated" style={styles.resultCard} className="bounce-in">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
            <Trophy size={48} color="var(--accent)" style={{ filter: 'drop-shadow(0 4px 12px rgba(245,158,11,0.4))' }} />
            <h2 style={styles.resultTitle}>{emoji}</h2>

            {/* Stars */}
            <div style={styles.starsRow}>
              {[1, 2, 3].map(i => (
                <Star
                  key={i}
                  size={28}
                  color={i <= stars ? '#f59e0b' : 'var(--border)'}
                  fill={i <= stars ? '#f59e0b' : 'none'}
                  style={{ transition: 'all 0.3s', transitionDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>

            {/* Score ring */}
            <ScoreRing score={score} total={questions.length} showGrade size={120} />

            {/* Stats */}
            <div style={styles.resultStats} className="stagger-children">
              <div style={styles.resultStat}>
                <Target size={16} color="var(--primary-light)" />
                <span>{score}/{questions.length} correct</span>
              </div>
              {maxStreak > 1 && (
                <div style={styles.resultStat}>
                  <Zap size={16} color="#f59e0b" />
                  <span>{maxStreak} best streak</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={styles.resultActions}>
              <Button variant="secondary" icon={<RotateCcw size={18} />} onClick={onRetry}>
                Try Again
              </Button>
              <Button variant="primary" onClick={onClose}>
                Continue
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Correct flash overlay */}
      {showCorrectFlash && <div style={styles.correctFlash} className="fade-in" />}

      {/* Streak banner */}
      {streak >= 2 && (
        <div style={styles.streakBanner} className="bounce-in">
          <Zap size={16} color="#f59e0b" />
          <span style={styles.streakText}>{streak} in a row!</span>
        </div>
      )}

      {/* Progress bar (linear) */}
      <div style={styles.progressBarWrap}>
        <Progress
          value={currentQ + (showResult ? 1 : 0)}
          max={questions.length}
          size="md"
        />
        <span style={styles.progressLabel}>
          {currentQ + 1} / {questions.length}
        </span>
      </div>

      {/* Score badges */}
      <div style={styles.scoreBadges}>
        <Badge variant="success" size="sm" icon={<CheckCircle size={14} />}>
          {score}
        </Badge>
        <Badge variant="error" size="sm" icon={<XCircle size={14} />}>
          {answers.length - score}
        </Badge>
      </div>

      {/* Question */}
      <Card
        style={{ ...styles.questionCard, ...(showWrongShake ? styles.shakeAnim : {}) }}
      >
        <div style={styles.questionNumber}>Q{currentQ + 1}</div>
        <p style={styles.questionText}>{question.question}</p>
      </Card>

      {/* Options */}
      <div style={styles.options} className="stagger-children">
        {question.options.map((opt, i) => {
          const letter = opt.charAt(0).toUpperCase();
          const optionText = opt.replace(/^[A-F][)]\s*/, '');
          const isSelected = selected === letter;
          const isAnswer = letter === question.correct;
          let optionStyle = { ...styles.option };

          if (showResult) {
            if (isAnswer) optionStyle = { ...optionStyle, ...styles.optionCorrect };
            else if (isSelected && !isCorrect) optionStyle = { ...optionStyle, ...styles.optionWrong };
            else optionStyle = { ...optionStyle, opacity: 0.4 };
          } else if (isSelected) {
            optionStyle = { ...optionStyle, ...styles.optionSelected };
          }

          return (
            <button key={i} style={optionStyle} onClick={() => handleSelect(opt)} disabled={showResult}>
              <span style={{ ...styles.optionLetter, background: showResult && isAnswer ? 'var(--success)' : showResult && isSelected && !isCorrect ? 'var(--error)' : `var(--primary)` }}>
                {letter}
              </span>
              <span style={styles.optionText}>{optionText}</span>
              {showResult && isAnswer && <CheckCircle size={20} color="var(--success)" />}
              {showResult && isSelected && !isCorrect && <XCircle size={20} color="var(--error)" />}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showResult && question.explanation && (
        <div style={styles.explanation} className="fade-in">
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Explanation</p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{question.explanation}</p>
        </div>
      )}

      {/* Next button */}
      {showResult && (
        <Button
          variant="primary"
          fullWidth
          icon={currentQ < questions.length - 1 ? <ArrowRight size={18} /> : <Trophy size={18} />}
          onClick={handleNext}
        >
          {currentQ < questions.length - 1 ? 'Next Question' : 'See Results'}
        </Button>
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
    position: 'relative',
  },

  // Correct flash
  correctFlash: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(16, 185, 129, 0.1)',
    pointerEvents: 'none', zIndex: 100,
  },

  // Streak
  streakBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '8px 16px',
    background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
    border: '1px solid rgba(245,158,11,0.3)',
    borderRadius: 20,
    alignSelf: 'center',
  },
  streakText: { fontSize: 13, fontWeight: 700, color: '#f59e0b' },

  // Progress bar
  progressBarWrap: { display: 'flex', alignItems: 'center', gap: 10 },
  progressLabel: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' },

  // Score badges
  scoreBadges: { display: 'flex', gap: 12, justifyContent: 'center' },

  // Question
  questionCard: { padding: 20, transition: 'transform 0.3s' },
  questionNumber: { fontSize: 11, fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  questionText: { fontSize: 17, fontWeight: 600, lineHeight: 1.5, color: 'var(--text-primary)' },
  shakeAnim: { animation: 'headShake 0.5s ease' },

  // Options
  options: { display: 'flex', flexDirection: 'column', gap: 10 },
  option: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 16px',
    background: 'var(--bg-card)', border: '2px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text-primary)',
    fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
    textAlign: 'left', transition: 'all 0.25s', width: '100%',
  },
  optionLetter: {
    width: 28, height: 28, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
  },
  optionSelected: { borderColor: 'var(--primary)', background: 'rgba(99,102,241,0.1)' },
  optionCorrect: { borderColor: 'var(--success)', background: 'rgba(16,185,129,0.1)' },
  optionWrong: { borderColor: 'var(--error)', background: 'rgba(239,68,68,0.1)' },
  optionText: { flex: 1 },
  explanation: {
    background: 'var(--bg-card)', borderRadius: 'var(--radius)',
    padding: 16, borderLeft: '3px solid var(--primary)',
  },

  // Results
  celebrationBg: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 120,
    overflow: 'hidden', pointerEvents: 'none',
  },
  confettiDots: { position: 'relative', width: '100%', height: '100%' },
  confettiDot: {
    position: 'absolute', width: 6, height: 6, borderRadius: '50%',
    animation: 'confettiFall 2s ease-in-out infinite',
    top: -10,
  },
  resultCard: {
    padding: 28, marginTop: 20,
  },
  resultTitle: { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' },
  starsRow: { display: 'flex', gap: 8 },
  resultStats: { display: 'flex', gap: 16 },
  resultStat: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 },
  resultActions: { display: 'flex', gap: 12, marginTop: 8 },
};
