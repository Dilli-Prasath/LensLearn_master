import { useState, useCallback, useMemo } from 'react';
import { CheckCircle, XCircle, ArrowRight, Trophy, RotateCcw, Zap, Target, Star } from 'lucide-react';
import Button from '../lib/components/Button';
import Card from '../lib/components/Card';
import Badge from '../lib/components/Badge';
import Progress from '../lib/components/Progress';
import ScoreRing from '../lib/components/ScoreRing';

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

  const questions = quiz?.questions || [];
  if (!questions.length) return null;

  const question = questions[currentQ];
  const isCorrect = selected === question.correct;

  const handleSelect = (option) => {
    if (showResult) return;
    const letter = option.charAt(0);
    setSelected(letter);
    setShowResult(true);

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
          const letter = opt.charAt(0);
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
              <span style={styles.optionText}>{opt.substring(3)}</span>
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
