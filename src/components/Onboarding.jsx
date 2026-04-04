import { useState } from 'react';
import { ChevronRight, Camera, Globe, Brain } from 'lucide-react';

export default function Onboarding({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Point Your Lens at Any Page',
      description: 'Capture textbook pages, homework problems, or any learning material with your camera',
      icon: Camera,
      color: '#6366f1',
    },
    {
      title: 'Get Explanations in Your Language',
      description: 'Choose from 15+ languages. LensLearn explains concepts at your learning level',
      icon: Globe,
      color: '#f59e0b',
    },
    {
      title: 'Quiz & Track Progress',
      description: 'Test your understanding with instant quizzes and build your learning streak',
      icon: Brain,
      color: '#10b981',
    },
  ];

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('lenslearn-onboarded', 'true');
    onComplete();
  };

  return (
    <div style={styles.container} className="slide-up">
      <div style={styles.background} />

      <div style={styles.content}>
        {/* Illustration */}
        <div style={styles.illustration}>
          <div
            style={{
              ...styles.illustrationCircle,
              background: `linear-gradient(135deg, ${slide.color}30, ${slide.color}10)`,
              borderColor: `${slide.color}40`,
            }}
          >
            <Icon size={64} color={slide.color} />
          </div>
        </div>

        {/* Text Content */}
        <h1 style={styles.title}>{slide.title}</h1>
        <p style={styles.description}>{slide.description}</p>

        {/* Dots Indicator */}
        <div style={styles.dotsContainer}>
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.dot,
                ...(i === currentSlide ? styles.dotActive : {}),
                transition: 'all var(--transition)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        {currentSlide > 0 && (
          <button
            style={styles.btnSecondary}
            onClick={() => setCurrentSlide(currentSlide - 1)}
          >
            Back
          </button>
        )}
        <button
          style={styles.btnPrimary}
          onClick={handleNext}
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-dark)',
    zIndex: 100,
  },
  background: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.05))',
    pointerEvents: 'none',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    gap: 32,
    position: 'relative',
    zIndex: 1,
  },
  illustration: {
    marginBottom: 8,
  },
  illustrationCircle: {
    width: 160,
    height: 160,
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'float 3s ease-in-out infinite',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text-primary)',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'var(--text-secondary)',
    textAlign: 'center',
    lineHeight: 1.6,
    maxWidth: 320,
  },
  dotsContainer: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--text-muted)',
    opacity: 0.3,
  },
  dotActive: {
    background: 'var(--primary-light)',
    opacity: 1,
    width: 28,
    borderRadius: 4,
  },
  actions: {
    display: 'flex',
    gap: 12,
    padding: '24px 24px 40px',
    position: 'relative',
    zIndex: 1,
  },
  btnPrimary: {
    flex: 1,
    padding: '14px 24px',
    background: 'var(--gradient-primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all var(--transition)',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
  },
  btnSecondary: {
    padding: '14px 24px',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all var(--transition)',
  },
};
