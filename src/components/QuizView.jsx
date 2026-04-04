import { useState, useCallback, useMemo } from 'react';
import { CheckCircle, XCircle, ArrowRight, Trophy, RotateCcw, Zap, Target, Star } from 'lucide-react';

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
    const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D';
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

        <div style={styles.resultCard} className="card bounce-in">
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

          {/* Score circle */}
          <div style={styles.scoreRingWrap}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="6" />
              <circle
                cx="60" cy="60" r="52"
                fill="none" stroke={percentage >= 70 ? 'var(--success)' : percentage >= 40 ? 'var(--accent)' : 'var(--error)'}
                strokeWidth="6"
                strokeDasharray={`${326.7 * (percentage / 100)} 326.7`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dasharray 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              />
            </svg>
            <div style={styles.scoreCenter}>
              <span style={styles.scoreGrade}>{grade}</span>
              <span style={styles.scorePercent}>{percentage}%</span>
            </div>
          </div>

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

          <div style={styles.resultActions}>
            <button className="btn btn-secondary" onClick={onRetry} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <RotateCcw size={18} />
              Try Again
            </button>
            <button className="btn btn-primary" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Continue
            </button>
          </div>
        </div>
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
        <div style={styles.progressBarTrack}>
          <div style={{
            ...styles.progressBarFill,
            width: `${((currentQ + (showResult ? 1 : 0)) / questions.length) * 100}%`,
          }} />
        </div>
        <span style={styles.progressLabel}>
          {currentQ + 1} / {questions.length}
        </span>
      </div>

      {/* Score badges */}
      <div style={styles.scoreBadges}>
        <div style={styles.scoreBadge}>
          <CheckCircle size={14} color="var(--success)" />
          <span style={{ color: 'var(--success)' }}>{score}</span>
        </div>
        <div style={styles.scoreBadge}>
          <XCircle size={14} color="var(--error)" />
          <span style={{ color: 'var(--error)' }}>{answers.length - score}</span>
        </div>
      </div>

      {/* Question */}
      <div
        className="card"
        style={{ ...styles.questionCard, ...(showWrongShake ? styles.shakeAnim : {}) }}
      >
        <div style={styles.questionNumber}>Q{currentQ + 1}</div>
        <p style={styles.questionText}>{question.question}</p>
      </div>

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
        <button className="btn btn-primary btn-full" onClick={handleNext} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {currentQ < questions.length - 1 ? (
            <><ArrowRight size={18} /> Next Question</>
          ) : (
            <><Trophy size={18} /> See Results</>
          )}
        </button>
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
  progressBarTrack: { flex: 1, height: 6, background: 'var(--bg-card)', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 3, transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' },
  progressLabel: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' },

  // Score badges
  scoreBadges: { display: 'flex', gap: 12, justifyContent: 'center' },
  scoreBadge: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 700 },

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
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', padding: 28, gap: 14, marginTop: 20,
  },
  resultTitle: { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' },
  starsRow: { display: 'flex', gap: 8 },
  scoreRingWrap: { position: 'relative', width: 120, height: 120 },
  scoreCenter: {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  scoreGrade: { fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' },
  scorePercent: { fontSize: 12, color: 'var(--text-muted)' },
  resultStats: { display: 'flex', gap: 16 },
  resultStat: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 },
  resultActions: { display: 'flex', gap: 12, marginTop: 8 },
};
