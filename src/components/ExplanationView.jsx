import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Volume2, VolumeX,
  MessageCircle, Brain, Send, Sparkles, Copy, Check, Share2, Layers, CloudOff,
  Heart, Globe, Download, X, RefreshCw, RotateCcw, Square, AlertTriangle, Bot, User
} from 'lucide-react';
import Button from '../lib/components/Button';
import Card from '../lib/components/Card';
import IconButton from '../lib/components/IconButton';
import Chip from '../lib/components/Chip';
import Modal from '../lib/components/Modal';
import LanguageSelector from '../lib/components/LanguageSelector';
import { useToggle, useThrottle } from '../lib/hooks';
import { copyToClipboard, shareContent } from '../lib/utils';
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
  const [isSpeaking, , setSpeakingTrue, setSpeakingFalse] = useToggle(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedImage, , setExpandedTrue, setExpandedFalse] = useToggle(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [followUpQ, setFollowUpQ] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpError, setFollowUpError] = useState('');
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked || false);
  const contentRef = useRef(null);
  const savedRef = useRef(false);

  // Adaptive streaming throttle based on device tier
  const THROTTLE_MS = adaptiveSettings.streamingThrottle;
  const [renderedExplanation, setRenderedExplanation] = useState(explanation);
  const throttledExplanation = useThrottle(explanation, THROTTLE_MS);

  useEffect(() => {
    if (!isStreaming) {
      setRenderedExplanation(explanation);
      return;
    }
    setRenderedExplanation(throttledExplanation);
  }, [throttledExplanation, isStreaming]);

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

  const handleToggleSpeech = useCallback(() => {
    if (isSpeaking) {
      speechService.stop();
      setSpeakingFalse();
    } else {
      speechService.speak(explanation, {
        language,
        onEnd: () => setSpeakingFalse()
      });
      setSpeakingTrue();
    }
  }, [isSpeaking, explanation, language, setSpeakingTrue, setSpeakingFalse]);

  const handleCopy = useCallback(async () => {
    try {
      await copyToClipboard(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [explanation]);

  const handleShare = useCallback(async () => {
    try {
      await shareContent({
        title: 'LensLearn Explanation',
        text: explanation,
        url: window.location.href
      });
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (err) {
      if (err.name !== 'AbortError') {
        await handleCopy();
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
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

  // Convert language string to LanguageSelector format
  const languageOptions = LANGUAGES.map(lang => ({ code: lang, name: lang }));

  return (
    <div style={styles.container} className={adaptiveSettings.enableAnimations ? 'slide-up' : ''}>
      {/* Language selector - using library component */}
      <div style={styles.topBar}>
        <LanguageSelector
          value={language}
          onChange={(code) => {
            onLanguageChange?.(code);
          }}
          languages={languageOptions}
          style={{ minWidth: 150 }}
        />
      </div>

      {/* Image thumbnail */}
      {imagePreview && (
        <div style={styles.imagePreviewContainer}>
          <button
            style={styles.imageThumbnail}
            onClick={() => setExpandedTrue()}
            title="View full image"
          >
            <img src={imagePreview} alt="Original" style={styles.imageThumbnailImg} loading="lazy" />
          </button>
        </div>
      )}

      {/* Expanded image modal - using library Modal component */}
      <Modal
        open={expandedImage}
        onClose={() => setExpandedFalse()}
        closable={true}
        closeOnOverlay={true}
        style={{ padding: 0 }}
      >
        <img src={imagePreview} alt="Original" style={styles.imageModalImg} loading="lazy" />
      </Modal>

      {/* Error card - using library Card component */}
      {isMainExplanationError && (
        <Card variant="default" style={styles.errorCard}>
          <Card.Header
            icon={<AlertTriangle size={20} color="var(--error)" />}
            title="Unable to generate explanation"
            style={{ marginBottom: 12 }}
          />
          <Card.Body style={styles.errorText}>
            {explanation}
          </Card.Body>
          <Card.Footer>
            <Button
              variant="danger"
              size="sm"
              icon={<RotateCcw size={16} />}
              onClick={handleRetry}
            >
              Retry
            </Button>
          </Card.Footer>
        </Card>
      )}

      {/* Explanation content - Card format with action buttons */}
      <Card style={styles.explanationCard} variant="default">
        <Card.Header
          icon={<Sparkles size={18} color="var(--accent)" />}
          title="Explanation"
          action={
            <div style={styles.cardActions}>
              <IconButton
                icon={<RefreshCw size={18} className={isRefreshing ? 'icon-spin' : ''} />}
                onClick={handleRetry}
                disabled={isStreaming}
                title="Refresh"
                variant="ghost"
                size="sm"
              />
              <IconButton
                icon={isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                onClick={handleToggleSpeech}
                title={isSpeaking ? 'Stop reading' : 'Read aloud'}
                variant={isSpeaking ? 'primary' : 'ghost'}
                size="sm"
              />
              <IconButton
                icon={copied ? <Check size={18} /> : <Copy size={18} />}
                onClick={handleCopy}
                title="Copy"
                variant={copied ? 'success' : 'ghost'}
                size="sm"
              />
              <IconButton
                icon={<Share2 size={18} />}
                onClick={handleShare}
                title="Share"
                variant={shared ? 'success' : 'ghost'}
                size="sm"
              />
              <IconButton
                icon={<Heart size={18} fill={bookmarked ? 'currentColor' : 'none'} />}
                onClick={handleToggleBookmark}
                title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                variant={bookmarked ? 'primary' : 'ghost'}
                size="sm"
              />
              {isStreaming && (
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Square size={14} />}
                  onClick={onAbort}
                  title="Stop generation"
                >
                  Stop
                </Button>
              )}
            </div>
          }
        />

        {isCached && (
          <div style={{ ...styles.offlineBadge, marginBottom: 8, marginLeft: 0 }}>
            <CloudOff size={14} />
            <span>Saved offline</span>
          </div>
        )}

        <Card.Body style={styles.content}>
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
        </Card.Body>
      </Card>

      {/* Suggested follow-up chips - using button elements with chip-like styling */}
      {!isStreaming && chatMessages.length > 0 && !followUpError && (
        <div style={styles.suggestedChipsContainer} className="slide-up">
          <div style={styles.suggestedChipsLabel}>Suggested follow-ups:</div>
          <div style={styles.suggestedChips} className="stagger-children">
            {SUGGESTED_FOLLOW_UPS.map((chipText, idx) => (
              <Chip
                key={idx}
                size="sm"
                disabled={followUpLoading}
                onClick={() => handleFollowUp(chipText)}
                style={{ cursor: 'pointer', border: '1px solid var(--border)' }}
              >
                {chipText}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons - using library Button component */}
      {!isStreaming && (
        <div style={styles.actions} className="stagger-children">
          <Button
            variant="secondary"
            size="md"
            icon={<Brain size={18} />}
            onClick={onGenerateQuiz}
            disabled={quizLoading}
            loading={quizLoading}
          >
            Quiz Me
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={<Layers size={18} />}
            onClick={onGenerateFlashcards}
            disabled={flashcardsLoading}
            loading={flashcardsLoading}
          >
            Flashcards
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={<Sparkles size={18} />}
            onClick={onSimplify}
          >
            Simplify
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={<Download size={18} />}
            onClick={handleExportNotes}
            title="Export notes"
          >
            Save Notes
          </Button>
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
            <Button
              variant="primary"
              size="sm"
              icon={<Send size={16} />}
              onClick={() => handleFollowUp()}
              disabled={!followUpQ.trim() || followUpLoading}
              loading={followUpLoading}
              style={{ width: 44, height: 44, padding: 0 }}
            />
          </div>

          {followUpError && (
            <div style={styles.followUpErrorContainer}>
              <div style={styles.followUpErrorText}>{followUpError}</div>
              <Button
                variant="danger"
                size="xs"
                icon={<RotateCcw size={12} />}
                onClick={() => handleFollowUp()}
              >
                Retry
              </Button>
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
  imagePreviewContainer: { display: 'flex', gap: 12, alignItems: 'center' },
  imageThumbnail: {
    width: 50, height: 50, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
    overflow: 'hidden', background: '#000', cursor: 'pointer', padding: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  imageThumbnailImg: { width: '100%', height: '100%', objectFit: 'cover' },
  imageModalImg: { maxWidth: '90%', maxHeight: '90%', borderRadius: 'var(--radius)', objectFit: 'contain' },
  errorCard: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid var(--error)', borderRadius: 'var(--radius)',
    padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
  },
  errorText: { color: 'var(--error)', fontSize: 14, lineHeight: 1.6, margin: 0 },
  explanationCard: { padding: 0, overflow: 'hidden' },
  offlineBadge: {
    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
    background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12, color: 'var(--text-secondary)',
  },
  cardActions: { display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' },
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
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  followUp: { display: 'flex', flexDirection: 'column', gap: 8 },
  followUpLabel: { display: 'flex', alignItems: 'center', gap: 6 },
  followUpInput: { display: 'flex', gap: 8, alignItems: 'center' },
  input: {
    flex: 1, padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
  },
  followUpErrorContainer: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid var(--error)', borderRadius: 'var(--radius)',
    padding: 12, display: 'flex', alignItems: 'center', gap: 8,
  },
  followUpErrorText: { color: 'var(--error)', fontSize: 14, flex: 1 },
};
