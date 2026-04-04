import { useState } from 'react';
import { CheckCircle, XCircle, ArrowRight, Trophy, RotateCcw } from 'lucide-react';

export default function QuizView({ quiz, onClose, onRetry }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  const questions = quiz?.questions || [];
  if (!questions.length) return null;

  const question = questions[currentQ];
  const isCorrect = selected === question.correct;

  const handleSelect = (option) => {
    if (showResult) return;
    const letter = option.charAt(0);
    setSelected(letter);
    setShowResult(true);
    if (letter === question.correct) setScore(s => s + 1);
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

    return (
      <div style={styles.container} className="slide-up">
        <div style={styles.resultCard} className="card">
          <Trophy size={48} color="var(--accent)" />
          <h2 style={styles.resultTitle}>{emoji}</h2>
          <div style={styles.scoreCircle}>
            <span style={styles.scoreNum}>{score}</span>
            <span style={styles.scoreDenom}>/ {questions.length}</span>
          </div>
          <p style={styles.resultText}>{percentage}% correct</p>
          <div style={styles.resultActions}>
            <button className="btn btn-secondary" onClick={onRetry}>
              <RotateCcw size={18} />
              Try Again
            </button>
            <button className="btn btn-primary" onClick={onClose}>
              Continue Learning
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
        <span style={styles.progressText}>Question {currentQ + 1} of {questions.length}</span>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${((currentQ + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="card" style={{ padding: 20 }}>
        <p style={styles.questionText}>{question.question}</p>
      </div>

      {/* Options */}
      <div style={styles.options}>
        {question.options.map((opt, i) => {
          const letter = opt.charAt(0);
          const isSelected = selected === letter;
          const isAnswer = letter === question.correct;
          let optionStyle = styles.option;

          if (showResult) {
            if (isAnswer) optionStyle = { ...styles.option, ...styles.optionCorrect };
            else if (isSelected && !isCorrect) optionStyle = { ...styles.option, ...styles.optionWrong };
            else optionStyle = { ...styles.option, opacity: 0.5 };
          } else if (isSelected) {
            optionStyle = { ...styles.option, ...styles.optionSelected };
          }

          return (
            <button
              key={i}
              style={optionStyle}
              onClick={() => handleSelect(opt)}
              disabled={showResult}
            >
              <span style={styles.optionText}>{opt}</span>
              {showResult && isAnswer && <CheckCircle size={20} color="var(--success)" />}
              {showResult && isSelected && !isCorrect && <XCircle size={20} color="var(--error)" />}
            </button>
          );
        })}
      </div>

      {/* Explanation after answering */}
      {showResult && question.explanation && (
        <div style={styles.explanation} className="fade-in">
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Explanation:</p>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>{question.explanation}</p>
        </div>
      )}

      {/* Next button */}
      {showResult && (
        <button className="btn btn-primary btn-full" onClick={handleNext}>
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
    gap: 16,
    padding: 16,
  },
  progress: { display: 'flex', flexDirection: 'column', gap: 8 },
  progressText: { fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 },
  progressBar: {
    height: 4,
    background: 'var(--bg-card)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'var(--primary)',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  questionText: {
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1.5,
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    background: 'var(--bg-card)',
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: 15,
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'all 0.2s',
    width: '100%',
  },
  optionSelected: {
    borderColor: 'var(--primary)',
    background: 'rgba(99,102,241,0.1)',
  },
  optionCorrect: {
    borderColor: 'var(--success)',
    background: 'rgba(16,185,129,0.1)',
  },
  optionWrong: {
    borderColor: 'var(--error)',
    background: 'rgba(239,68,68,0.1)',
  },
  optionText: { flex: 1 },
  explanation: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    padding: 16,
    borderLeft: '3px solid var(--primary)',
  },
  resultCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: 32,
    gap: 16,
  },
  resultTitle: { fontSize: 24, fontWeight: 700 },
  scoreCircle: { display: 'flex', alignItems: 'baseline', gap: 4 },
  scoreNum: { fontSize: 48, fontWeight: 800, color: 'var(--primary-light)' },
  scoreDenom: { fontSize: 20, color: 'var(--text-muted)' },
  resultText: { fontSize: 16, color: 'var(--text-secondary)' },
  resultActions: { display: 'flex', gap: 12, marginTop: 8 },
};
