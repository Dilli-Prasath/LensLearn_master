import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Volume2, VolumeX,
  MessageCircle, Brain, Send, Sparkles, Copy, Check, Share2, Layers, CloudOff,
  Heart, Globe, Download, X, RefreshCw, RotateCcw, Square, AlertTriangle, Bot, User
} from 'lucide-react';
import speechService from '../services/speechService';
import cacheService from '../services/cacheService';
import exportService from '../services/exportService';
import { adaptiveSettings, device } from '../utils/performance';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Portuguese',
  'Hindi', 'Tamil', 'Bengali', 'Arabic', 'Chinese',
  'Japanese', 'Korean', 'Indonesian', 'Swahili', 'Russian'
];

const SUGGESTED_FOLLOW_UPS = [
  'Give me an example',
  'Explain it simpler',
  'What are the key terms?',
  'Why is this important?'
];

// Memoized single chat message — prevents re-rendering all messages on each update
const ChatMessage = memo(({ msg, mdComponents, isLatest }) => (
  <div
    style={{ ...msgStyles.bubble, ...(msg.role === 'user' ? msgStyles.user : msgStyles.assistant) }}
    className={isLatest ? (msg.role === 'user' ? 'slide-in-right' : 'slide-in-left') : ''}
  >
    <div style={{ ...msgStyles.icon, ...(msg.role === 'user' ? msgStyles.iconUser : {}) }}>
      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
    </div>
    <div style={{ ...msgStyles.content, ...(msg.role === 'user' ? msgStyles.contentUser : {}) }}>
      <ReactMarkdown components={mdComponents}>
        {msg.content}
      </ReactMarkdown>
    </div>
  </div>
));
ChatMessage.displayName = 'ChatMessage';

export default function ExplanationView({
  explanation,
  isStreaming,
  imagePreview,
  language,
  onGenerateQuiz,
  onGenerateFlashcards,
  onSimplify,
  onAskFollowUp,
  quizLoading,
  flashcardsLoading,
  onSaveSession,
  imageHash,
  sessionId,
  isBookmarked,
  onToggleBookmark,
  onLanguageChange,
  onRetry,
  onAbort,
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedImage, setExpandedImage] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [followUpQ, setFollowUpQ] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpError, setFollowUpError] = useState('');
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked || false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const contentRef = useRef(null);
  const savedRef = useRef(false);

  // Adaptive streaming throttle based on device tier
  const THROTTLE_MS = adaptiveSettings.streamingThrottle;
  const [renderedExplanation, setRenderedExplanation] = useState(explanation);
  const throttleRef = useRef(null);

  useEffect(() => {
    if (!isStreaming) {
      setRenderedExplanation(explanation);
      if (throttleRef.current) { clearTimeout(throttleRef.current); throttleRef.current = null; }
      return;
    }
    if (!throttleRef.current) {
      throttleRef.current = setTimeout(() => {
        setRenderedExplanation(explanation);
        throttleRef.current = null;
      }, THROTTLE_MS);
    }
  }, [explanation, isStreaming, THROTTLE_MS]);

  useEffect(() => () => { if (throttleRef.current) clearTimeout(throttleRef.current); }, []);

  // Auto-scroll — throttled for low-end
  const scrollTimeoutRef = useRef(null);
  useEffect(() => {
    if (contentRef.current) {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }, device.tier === 'low' ? 200 : 50);
    }
    return () => { if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current); };
  }, [renderedExplanation, chatMessages.length, isStreaming]);

  // Cache check
  useEffect(() => {
    if (imageHash) {
      const cached = cacheService.getCachedExplanation(imageHash);
      setIsCached(!!cached);
    }
  }, [imageHash, explanation]);

  // Auto-save session when explanation completes
  useEffect(() => {
    if (!isStreaming && explanation && !savedRef.current && imagePreview) {
      savedRef.current = true;
      onSaveSession?.();
    }
  }, [isStreaming, explanation, imagePreview, onSaveSession]);

  // Initialize chat messages from explanation
  useEffect(() => {
    setChatMessages(prev => {
      if (prev.length === 0) {
        return [{ role: 'assistant', content: explanation, timestamp: Date.now() }];
      }
      const updated = [...prev];
      updated[0] = { ...updated[0], content: explanation };
      return updated;
    });
  }, [explanation]);

  const toggleSpeech = useCallback(() => {
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
  }, [isSpeaking, explanation, language]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [explanation]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'LensLearn Explanation', text: explanation });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      handleCopy();
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }, [explanation, handleCopy]);

  const handleToggleBookmark = useCallback(() => {
    if (sessionId && onToggleBookmark) {
      const newState = onToggleBookmark(sessionId);
      setBookmarked(newState);
    }
  }, [sessionId, onToggleBookmark]);

  const handleFollowUp = useCallback(async (question) => {
    const query = question || followUpQ;
    if (!query.trim() || followUpLoading) return;

    setFollowUpError('');
    setChatMessages(prev => [...prev, { role: 'user', content: query, timestamp: Date.now() }]);
    setFollowUpQ('');
    setFollowUpLoading(true);

    try {
      const answer = await onAskFollowUp(query);
      setChatMessages(prev => [...prev, { role: 'assistant', content: answer, timestamp: Date.now() }]);
    } catch (err) {
      const errorMsg = 'Sorry, I could not process that question. Please try again.';
      setChatMessages(prev => [...prev, { role: 'assistant', content: errorMsg, timestamp: Date.now() }]);
      setFollowUpError(errorMsg);
    }
    setFollowUpLoading(false);
  }, [followUpQ, followUpLoading, onAskFollowUp]);

  const handleRetry = useCallback(() => {
    setFollowUpError('');
    setIsRefreshing(true);
    onRetry?.();
    setTimeout(() => setIsRefreshing(false), 800);
  }, [onRetry]);

  const isMainExplanationError = explanation && (explanation.includes('Connection Error') || explanation.includes('Error:'));

  // Memoize markdown components — static, never changes
  const mdComponents = useMemo(() => ({
    h1: ({ children }) => <h3 style={mdStyles.h}>{children}</h3>,
    h2: ({ children }) => <h4 style={mdStyles.h}>{children}</h4>,
    h3: ({ children }) => <h5 style={mdStyles.h}>{children}</h5>,
    p: ({ children }) => <p style={mdStyles.p}>{children}</p>,
    strong: ({ children }) => <strong style={mdStyles.strong}>{children}</strong>,
    code: ({ children }) => <code style={mdStyles.code}>{children}</code>,
    li: ({ children }) => <li style={mdStyles.li}>{children}</li>,
    ul: ({ children }) => <ul style={mdStyles.ul}>{children}</ul>,
    ol: ({ children }) => <ol style={mdStyles.ol}>{children}</ol>,
  }), []);

  const handleExportNotes = useCallback(() => {
    exportService.exportAsText(explanation, {
      subject: 'Study Notes',
      language,
      timestamp: new Date().toISOString(),
      imageHash
    });
  }, [explanation, language, imageHash]);

  // Only render the last N messages for performance on low-end devices
  const maxVisible = adaptiveSettings.maxVisibleMessages;
  const visibleMessages = chatMessages.length > maxVisible
    ? chatMessages.slice(-maxVisible)
    : chatMessages;
  const hiddenCount = chatMessages.length - visibleMessages.length;

  // For the first message (main explanation), use the throttled version during streaming
  const displayMessages = useMemo(() => {
    if (isStreaming && visibleMessages.length > 0 && visibleMessages[0] === chatMessages[0]) {
      const updated = [...visibleMessages];
      updated[0] = { ...updated[0], content: renderedExplanation };
      return updated;
    }
    return visibleMessages;
  }, [visibleMessages, chatMessages, isStreaming, renderedExplanation]);

  return (
    <div style={styles.container} className={adaptiveSettings.enableAnimations ? 'slide-up' : ''}>
      {/* Language selector */}
      <div style={styles.topBar}>
        <button
          style={styles.languageBtn}
          onClick={() => setShowLanguageSelector(!showLanguageSelector)}
          title="Change explanation language"
        >
          <Globe size={16} />
          <span>{language}</span>
        </button>
        {showLanguageSelector && (
          <div style={styles.languageDropdown}>
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                style={{
                  ...styles.languageOption,
                  ...(language === lang ? styles.languageOptionActive : {})
                }}
                onClick={() => {
                  onLanguageChange?.(lang);
                  setShowLanguageSelector(false);
                }}
              >
                {lang}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Image thumbnail */}
      {imagePreview && (
        <div style={styles.imagePreviewContainer}>
          <button
            style={styles.imageThumbnail}
            onClick={() => setExpandedImage(true)}
            title="View full image"
          >
            <img src={imagePreview} alt="Original" style={styles.imageThumbnailImg} loading="lazy" />
          </button>
        </div>
      )}

      {/* Expanded image modal */}
      {expandedImage && imagePreview && (
        <div style={styles.imageModalOverlay} onClick={() => setExpandedImage(false)}>
          <button style={styles.imageCloseBtn} onClick={() => setExpandedImage(false)}>
            <X size={24} />
          </button>
          <img src={imagePreview} alt="Original" style={styles.imageModalImg} loading="lazy" />
        </div>
      )}

      {/* Error card */}
      {isMainExplanationError && (
        <div style={styles.errorCard}>
          <div style={styles.errorHeader}>
            <AlertTriangle size={20} color="var(--error)" />
            <span style={{ color: 'var(--error)', fontWeight: 600 }}>Unable to generate explanation</span>
          </div>
          <p style={styles.errorText}>{explanation}</p>
          <button style={styles.retryButton} onClick={handleRetry}>
            <RotateCcw size={16} />
            Retry
          </button>
        </div>
      )}

      {/* Explanation content - Chat format */}
      <div style={styles.explanationCard} className="card">
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>
            <Sparkles size={18} color="var(--accent)" />
            <span>Explanation</span>
            {isCached && (
              <div style={styles.offlineBadge}>
                <CloudOff size={14} />
                <span>Saved offline</span>
              </div>
            )}
          </div>
          <div style={styles.cardActions}>
            <button style={styles.iconBtn} onClick={handleRetry} title="Refresh" disabled={isStreaming}>
              <RefreshCw
                size={18}
                color={isRefreshing ? 'var(--primary-light)' : 'var(--text-secondary)'}
                className={isRefreshing ? 'icon-spin' : ''}
              />
            </button>
            <button style={styles.iconBtn} onClick={toggleSpeech} title={isSpeaking ? 'Stop reading' : 'Read aloud'}>
              {isSpeaking ? <VolumeX size={18} color="var(--accent)" /> : <Volume2 size={18} color="var(--text-secondary)" />}
            </button>
            <button style={styles.iconBtn} onClick={handleCopy} title="Copy">
              {copied ? <Check size={18} color="var(--success)" /> : <Copy size={18} color="var(--text-secondary)" />}
            </button>
            <button style={styles.iconBtn} onClick={handleShare} title="Share">
              {shared ? <Check size={18} color="var(--success)" /> : <Share2 size={18} color="var(--text-secondary)" />}
            </button>
            <button style={styles.iconBtn} onClick={handleToggleBookmark} title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}>
              {bookmarked ? <Heart size={18} color="var(--accent)" fill="var(--accent)" /> : <Heart size={18} color="var(--text-secondary)" />}
            </button>
            {isStreaming && (
              <button style={styles.stopBtn} onClick={onAbort} title="Stop generation">
                <Square size={16} />
                Stop
              </button>
            )}
          </div>
        </div>

        <div ref={contentRef} style={styles.content}>
          {/* Hidden message count */}
          {hiddenCount > 0 && (
            <div style={styles.hiddenBanner}>
              {hiddenCount} older message{hiddenCount > 1 ? 's' : ''} hidden for performance
            </div>
          )}

          {/* Chat thread — memoized per message */}
          {displayMessages.map((msg, idx) => (
            <ChatMessage
              key={`${msg.timestamp}-${idx}`}
              msg={msg}
              mdComponents={mdComponents}
              isLatest={idx === displayMessages.length - 1}
            />
          ))}

          {/* Streaming indicator with bouncing dots */}
          {isStreaming && (
            <div style={styles.streamingIndicator} className="fade-in">
              <div style={styles.streamingDots}>
                <span style={{ ...styles.dot, animationDelay: '0ms' }} />
                <span style={{ ...styles.dot, animationDelay: '150ms' }} />
                <span style={{ ...styles.dot, animationDelay: '300ms' }} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Generating...</span>
            </div>
          )}
        </div>
      </div>

      {/* Suggested follow-up chips */}
      {!isStreaming && chatMessages.length > 0 && !followUpError && (
        <div style={styles.suggestedChipsContainer} className="slide-up">
          <div style={styles.suggestedChipsLabel}>Suggested follow-ups:</div>
          <div style={styles.suggestedChips} className="stagger-children">
            {SUGGESTED_FOLLOW_UPS.map((chip, idx) => (
              <button
                key={idx}
                style={styles.chip}
                onClick={() => handleFollowUp(chip)}
                disabled={followUpLoading}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!isStreaming && (
        <div style={styles.actions} className="stagger-children">
          <button className="btn btn-secondary hover-lift" onClick={onGenerateQuiz} disabled={quizLoading}>
            <Brain size={18} className={quizLoading ? 'icon-spin-slow' : ''} />
            {quizLoading ? 'Generating...' : 'Quiz Me'}
          </button>
          <button className="btn btn-secondary hover-lift" onClick={onGenerateFlashcards} disabled={flashcardsLoading}>
            <Layers size={18} className={flashcardsLoading ? 'icon-spin-slow' : ''} />
            {flashcardsLoading ? 'Creating...' : 'Flashcards'}
          </button>
          <button className="btn btn-secondary hover-lift" onClick={onSimplify}>
            <Sparkles size={18} />
            Simplify
          </button>
          <button className="btn btn-secondary hover-lift" onClick={handleExportNotes} title="Export notes">
            <Download size={18} />
            Save Notes
          </button>
        </div>
      )}

      {/* Follow-up input */}
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
              style={{ ...styles.sendBtn, opacity: followUpQ.trim() ? 1 : 0.4 }}
              onClick={() => handleFollowUp()}
              disabled={!followUpQ.trim() || followUpLoading}
            >
              {followUpLoading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <Send size={18} />}
            </button>
          </div>

          {followUpError && (
            <div style={styles.followUpErrorContainer}>
              <div style={styles.followUpErrorText}>{followUpError}</div>
              <button style={styles.inlineRetryBtn} onClick={() => handleFollowUp()}>
                <RotateCcw size={14} />
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Static message styles (never recreated)
const msgStyles = {
  bubble: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  user: { flexDirection: 'row-reverse' },
  assistant: { flexDirection: 'row' },
  icon: {
    width: 30, height: 30, borderRadius: '50%', background: 'rgba(99,102,241,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--primary-light)',
    marginTop: 2,
  },
  iconUser: {
    background: 'rgba(245,158,11,0.12)', color: 'var(--accent)',
  },
  content: {
    maxWidth: '85%', padding: '10px 14px', borderRadius: 'var(--radius)',
    background: 'var(--bg-dark)', wordWrap: 'break-word',
    borderTopLeftRadius: 4,
  },
  contentUser: {
    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)',
    borderTopRightRadius: 4, borderTopLeftRadius: 'var(--radius)',
  },
};

// Static markdown styles
const mdStyles = {
  h: { marginTop: 16, marginBottom: 8, color: 'var(--primary-light)', fontSize: 16, fontWeight: 700 },
  p: { marginBottom: 12, lineHeight: 1.7, margin: '0 0 12px 0' },
  strong: { color: 'var(--primary-light)' },
  code: { background: 'var(--bg-input)', padding: '2px 6px', borderRadius: 4, fontSize: 13, fontFamily: 'monospace' },
  li: { marginBottom: 6, marginLeft: 4 },
  ul: { paddingLeft: 20, marginBottom: 12 },
  ol: { paddingLeft: 20, marginBottom: 12 },
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: 16, padding: 16 },
  topBar: { display: 'flex', alignItems: 'center', position: 'relative', marginBottom: 8 },
  languageBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
  },
  languageDropdown: {
    position: 'absolute', top: '100%', left: 0, marginTop: 4,
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    zIndex: 10, maxHeight: 240, overflowY: 'auto', minWidth: 120,
    display: 'flex', flexDirection: 'column',
  },
  languageOption: {
    padding: '8px 12px', background: 'none', border: 'none',
    color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
  },
  languageOptionActive: { background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)' },
  imagePreviewContainer: { display: 'flex', gap: 12, alignItems: 'center' },
  imageThumbnail: {
    width: 50, height: 50, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
    overflow: 'hidden', background: '#000', cursor: 'pointer', padding: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  imageThumbnailImg: { width: '100%', height: '100%', objectFit: 'cover' },
  imageModalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  imageCloseBtn: {
    position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)',
    border: 'none', color: 'white', cursor: 'pointer', padding: 8, borderRadius: 'var(--radius)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  imageModalImg: { maxWidth: '90%', maxHeight: '90%', borderRadius: 'var(--radius)', objectFit: 'contain' },
  errorCard: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid var(--error)', borderRadius: 'var(--radius)',
    padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
  },
  errorHeader: { display: 'flex', alignItems: 'center', gap: 8 },
  errorText: { color: 'var(--error)', fontSize: 14, lineHeight: 1.6, margin: 0 },
  retryButton: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
    background: 'var(--error)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)',
    cursor: 'pointer', fontSize: 14, fontWeight: 600, alignSelf: 'flex-start',
  },
  explanationCard: { padding: 0, overflow: 'hidden' },
  cardHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 8,
  },
  cardTitle: { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 15 },
  offlineBadge: {
    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
    background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12, color: 'var(--text-secondary)',
  },
  cardActions: { display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' },
  iconBtn: {
    background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6,
    display: 'flex', alignItems: 'center',
  },
  stopBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
    background: 'var(--error)', border: 'none', color: 'white', borderRadius: 6,
    cursor: 'pointer', fontSize: 13, fontWeight: 600,
  },
  content: {
    padding: '16px 20px 20px', maxHeight: '60vh', overflowY: 'auto',
    lineHeight: 1.7, fontSize: 15, color: 'var(--text-primary)',
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  hiddenBanner: {
    textAlign: 'center', padding: '8px 12px', background: 'var(--bg-dark)',
    borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text-muted)',
  },
  streamingIndicator: {
    display: 'flex', alignItems: 'center', gap: 8, padding: 12,
    background: 'var(--bg-dark)', borderRadius: 'var(--radius)',
  },
  streamingDots: { display: 'flex', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-light)', animation: 'dotBounce 1.2s ease-in-out infinite' },
  suggestedChipsContainer: { display: 'flex', flexDirection: 'column', gap: 8 },
  suggestedChipsLabel: { fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 },
  suggestedChips: { display: 'flex', gap: 8, flexWrap: 'wrap', overflowX: 'auto', paddingBottom: 4 },
  chip: {
    padding: '8px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text-secondary)', fontSize: 13,
    cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0,
  },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  followUp: { display: 'flex', flexDirection: 'column', gap: 8 },
  followUpLabel: { display: 'flex', alignItems: 'center', gap: 6 },
  followUpInput: { display: 'flex', gap: 8, alignItems: 'center' },
  input: {
    flex: 1, padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 'var(--radius)', background: 'var(--primary)',
    border: 'none', color: 'white', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  followUpErrorContainer: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid var(--error)', borderRadius: 'var(--radius)',
    padding: 12, display: 'flex', alignItems: 'center', gap: 8,
  },
  followUpErrorText: { color: 'var(--error)', fontSize: 14, flex: 1 },
  inlineRetryBtn: {
    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px',
    background: 'var(--error)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)',
    cursor: 'pointer', fontSize: 12, fontWeight: 600, flexShrink: 0,
  },
};
