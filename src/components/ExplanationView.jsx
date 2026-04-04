import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Volume2, VolumeX, ChevronDown, ChevronUp,
  MessageCircle, Brain, Send, Sparkles, Copy, Check, Share2
} from 'lucide-react';
import speechService from '../services/speechService';
import historyService from '../services/historyService';

export default function ExplanationView({
  explanation,
  isStreaming,
  imagePreview,
  language,
  onGenerateQuiz,
  onSimplify,
  onAskFollowUp,
  quizLoading,
  onSaveSession,
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [followUpQ, setFollowUpQ] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const contentRef = useRef(null);
  const savedRef = useRef(false);

  useEffect(() => {
    if (contentRef.current && isStreaming) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [explanation, isStreaming]);

  // Auto-save session when explanation is complete
  useEffect(() => {
    if (!isStreaming && explanation && !savedRef.current && imagePreview) {
      savedRef.current = true;
      onSaveSession?.();
    }
  }, [isStreaming, explanation, imagePreview, onSaveSession]);

  const toggleSpeech = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      speechService.speak(explanation, {
        language,
        onEnd: () => setIsSpeaking(false)
      });
      setIsSpeaking(true);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LensLearn Explanation',
          text: explanation,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      handleCopy();
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleFollowUp = async () => {
    if (!followUpQ.trim() || followUpLoading) return;
    setFollowUpLoading(true);
    try {
      const answer = await onAskFollowUp(followUpQ);
      setFollowUpAnswer(answer);
      setFollowUpQ('');
    } catch {
      setFollowUpAnswer('Sorry, I could not process that question. Please try again.');
    }
    setFollowUpLoading(false);
  };

  return (
    <div style={styles.container} className="slide-up">
      {/* Image toggle */}
      {imagePreview && (
        <button style={styles.imageToggle} onClick={() => setShowImage(!showImage)}>
          {showImage ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showImage ? 'Hide image' : 'Show original image'}
        </button>
      )}
      {showImage && imagePreview && (
        <img src={imagePreview} alt="Original" style={styles.thumbnailImage} />
      )}

      {/* Explanation content */}
      <div style={styles.explanationCard} className="card">
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>
            <Sparkles size={18} color="var(--accent)" />
            <span>Explanation</span>
          </div>
          <div style={styles.cardActions}>
            <button style={styles.iconBtn} onClick={toggleSpeech} title={isSpeaking ? 'Stop reading' : 'Read aloud'}>
              {isSpeaking ? <VolumeX size={18} color="var(--accent)" /> : <Volume2 size={18} color="var(--text-secondary)" />}
            </button>
            <button style={styles.iconBtn} onClick={handleCopy} title="Copy">
              {copied ? <Check size={18} color="var(--success)" /> : <Copy size={18} color="var(--text-secondary)" />}
            </button>
            <button style={styles.iconBtn} onClick={handleShare} title="Share">
              {shared ? <Check size={18} color="var(--success)" /> : <Share2 size={18} color="var(--text-secondary)" />}
            </button>
          </div>
        </div>

        <div ref={contentRef} style={styles.content}>
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h3 style={styles.mdH}>{children}</h3>,
              h2: ({ children }) => <h4 style={styles.mdH}>{children}</h4>,
              h3: ({ children }) => <h5 style={styles.mdH}>{children}</h5>,
              p: ({ children }) => <p style={styles.mdP}>{children}</p>,
              strong: ({ children }) => <strong style={{ color: 'var(--primary-light)' }}>{children}</strong>,
              code: ({ children }) => <code style={styles.mdCode}>{children}</code>,
              li: ({ children }) => <li style={styles.mdLi}>{children}</li>,
              ul: ({ children }) => <ul style={styles.mdUl}>{children}</ul>,
              ol: ({ children }) => <ol style={styles.mdOl}>{children}</ol>,
            }}
          >
            {explanation}
          </ReactMarkdown>
          {isStreaming && <span style={styles.cursor}>|</span>}
        </div>
      </div>

      {/* Action buttons */}
      {!isStreaming && (
        <div style={styles.actions}>
          <button className="btn btn-secondary" onClick={onGenerateQuiz} disabled={quizLoading}>
            <Brain size={18} />
            {quizLoading ? 'Generating...' : 'Quiz Me'}
          </button>
          <button className="btn btn-secondary" onClick={onSimplify}>
            <Sparkles size={18} />
            Simplify
          </button>
        </div>
      )}

      {/* Follow-up question */}
      {!isStreaming && (
        <div style={styles.followUp}>
          <div style={styles.followUpLabel}>
            <MessageCircle size={16} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Ask a follow-up question</span>
          </div>
          <div style={styles.followUpInput}>
            <input
              type="text"
              value={followUpQ}
              onChange={(e) => setFollowUpQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFollowUp()}
              placeholder="e.g., Can you give me another example?"
              style={styles.input}
              disabled={followUpLoading}
            />
            <button
              style={{
                ...styles.sendBtn,
                opacity: followUpQ.trim() ? 1 : 0.4
              }}
              onClick={handleFollowUp}
              disabled={!followUpQ.trim() || followUpLoading}
            >
              {followUpLoading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <Send size={18} />}
            </button>
          </div>

          {followUpAnswer && (
            <div style={styles.followUpAnswer} className="fade-in">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p style={styles.mdP}>{children}</p>,
                  strong: ({ children }) => <strong style={{ color: 'var(--primary-light)' }}>{children}</strong>,
                }}
              >
                {followUpAnswer}
              </ReactMarkdown>
            </div>
          )}
        </div>
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
  imageToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 13,
    cursor: 'pointer',
    padding: '4px 0',
  },
  thumbnailImage: {
    width: '100%',
    maxHeight: 160,
    objectFit: 'contain',
    borderRadius: 'var(--radius)',
    background: '#000',
    marginBottom: 4,
  },
  explanationCard: { padding: 0, overflow: 'hidden' },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid var(--border)',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 600,
    fontSize: 15,
  },
  cardActions: { display: 'flex', gap: 4 },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 6,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
  },
  content: {
    padding: '16px 20px 20px',
    maxHeight: 400,
    overflowY: 'auto',
    lineHeight: 1.7,
    fontSize: 15,
    color: 'var(--text-primary)',
  },
  cursor: {
    display: 'inline-block',
    color: 'var(--primary-light)',
    animation: 'pulse 1s infinite',
    fontWeight: 'bold',
  },
  mdH: { marginTop: 16, marginBottom: 8, color: 'var(--primary-light)', fontSize: 16, fontWeight: 700 },
  mdP: { marginBottom: 12, lineHeight: 1.7 },
  mdCode: {
    background: 'var(--bg-dark)',
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  mdLi: { marginBottom: 6, marginLeft: 4 },
  mdUl: { paddingLeft: 20, marginBottom: 12 },
  mdOl: { paddingLeft: 20, marginBottom: 12 },
  actions: {
    display: 'flex',
    gap: 12,
  },
  followUp: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  followUpLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  followUpInput: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 'var(--radius)',
    background: 'var(--primary)',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  followUpAnswer: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    padding: 16,
    border: '1px solid var(--border)',
    marginTop: 4,
  },
};
