/**
 * ChatThread - Reusable chat conversation thread component
 *
 * A compound component for displaying conversation threads with markdown support,
 * streaming indicators, and pagination controls. Used in ExplanationView.
 *
 * Usage:
 *   <ChatThread messages={messages} isStreaming={false}>
 *     <ChatThread.Message message={msg} />
 *   </ChatThread>
 *
 *   <ChatThread messages={messages} isStreaming={true} maxVisible={20}>
 *     <ChatThread.StreamingIndicator />
 *   </ChatThread>
 *
 * Sub-components:
 *   - ChatThread.Message: Memoized message renderer with role icon and markdown
 *   - ChatThread.StreamingIndicator: Animated loading indicator
 *   - ChatThread.HiddenBanner: Shows count of hidden messages
 */
import { forwardRef, memo, useMemo, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageCircle, Bot } from 'lucide-react';

// ─── Message Component ──────────────────────────────────────
const Message = memo(function Message({
  message,
  markdownComponents = {},
  style,
  ...props
}) {
  if (!message || !message.role || !message.content) {
    return null;
  }

  const isBot = message.role === 'assistant' || message.role === 'bot';
  const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : null;

  const containerStyle = useMemo(() => ({
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    alignItems: 'flex-start',
    justifyContent: isBot ? 'flex-start' : 'flex-end',
    ...style,
  }), [isBot, style]);

  const messageWrapperStyle = useMemo(() => ({
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    flexDirection: isBot ? 'row' : 'row-reverse',
    maxWidth: '85%',
  }), [isBot]);

  const iconStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: isBot ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
    color: isBot ? 'var(--accent-main, #6366f1)' : '#10b981',
  }), [isBot]);

  const bubbleStyle = useMemo(() => ({
    backgroundColor: isBot ? 'var(--bg-tertiary, #334155)' : 'var(--accent-main, #6366f1)',
    color: isBot ? 'var(--text-secondary, #94a3b8)' : '#ffffff',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    wordBreak: 'break-word',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  }), [isBot]);

  const timestampStyle = useMemo(() => ({
    fontSize: '0.7rem',
    color: 'var(--text-tertiary, #64748b)',
    marginTop: '4px',
    textAlign: isBot ? 'left' : 'right',
  }), [isBot]);

  const defaultMarkdownComponents = {
    p: ({ node, ...props }) => <p style={{ margin: '0 0 8px 0' }} {...props} />,
    ul: ({ node, ...props }) => <ul style={{ margin: '8px 0', paddingLeft: '20px' }} {...props} />,
    ol: ({ node, ...props }) => <ol style={{ margin: '8px 0', paddingLeft: '20px' }} {...props} />,
    li: ({ node, ...props }) => <li style={{ margin: '4px 0' }} {...props} />,
    code: ({ node, inline, ...props }) => (
      <code
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          padding: inline ? '2px 6px' : '12px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '0.85em',
          display: inline ? 'inline' : 'block',
          overflow: 'auto',
        }}
        {...props}
      />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote
        style={{
          borderLeft: '3px solid var(--accent-main, #6366f1)',
          paddingLeft: '12px',
          margin: '8px 0',
          fontStyle: 'italic',
          opacity: 0.8,
        }}
        {...props}
      />
    ),
    a: ({ node, ...props }) => (
      <a style={{ color: 'inherit', textDecoration: 'underline', opacity: 0.9 }} {...props} />
    ),
    ...markdownComponents,
  };

  return (
    <div style={containerStyle} {...props}>
      <div style={messageWrapperStyle}>
        <div style={iconStyle}>
          {isBot ? <Bot size={16} /> : <MessageCircle size={16} />}
        </div>
        <div>
          <div style={bubbleStyle}>
            <ReactMarkdown components={defaultMarkdownComponents}>
              {message.content}
            </ReactMarkdown>
          </div>
          {timestamp && <div style={timestampStyle}>{timestamp}</div>}
        </div>
      </div>
    </div>
  );
});

Message.displayName = 'ChatThread.Message';

// ─── Streaming Indicator ────────────────────────────────────
const StreamingIndicator = memo(function StreamingIndicator({ style, ...props }) {
  const dotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-main, #6366f1)',
    animation: 'pulse 1.4s infinite',
  };

  const containerStyle = useMemo(() => ({
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 16px',
    ...style,
  }), [style]);

  return (
    <div style={containerStyle} {...props}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
      <div style={dotStyle} />
      <div style={{ ...dotStyle, animationDelay: '0.2s' }} />
      <div style={{ ...dotStyle, animationDelay: '0.4s' }} />
    </div>
  );
});

StreamingIndicator.displayName = 'ChatThread.StreamingIndicator';

// ─── Hidden Banner ──────────────────────────────────────────
const HiddenBanner = memo(function HiddenBanner({
  hiddenCount,
  onExpand,
  style,
  ...props
}) {
  const bannerStyle = useMemo(() => ({
    padding: '8px 12px',
    textAlign: 'center',
    fontSize: '0.8125rem',
    color: 'var(--text-secondary, #94a3b8)',
    backgroundColor: 'var(--bg-tertiary, #334155)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    '&:hover': {
      backgroundColor: 'var(--bg-secondary, #1e293b)',
    },
    ...style,
  }), [style]);

  return (
    <div
      style={bannerStyle}
      onClick={onExpand}
      role="button"
      tabIndex={0}
      aria-label={`Show ${hiddenCount} hidden messages`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onExpand?.();
        }
      }}
      {...props}
    >
      Show {hiddenCount} previous message{hiddenCount !== 1 ? 's' : ''}
    </div>
  );
});

HiddenBanner.displayName = 'ChatThread.HiddenBanner';

// ─── Main ChatThread Component ──────────────────────────────
const ChatThread = forwardRef(function ChatThread(
  {
    messages = [],
    isStreaming = false,
    maxVisible = 20,
    markdownComponents = {},
    onScroll,
    style,
    children,
    ...props
  },
  ref
) {
  const scrollContainerRef = useRef(ref);
  const hiddenCount = Math.max(0, messages.length - maxVisible);
  const visibleMessages = messages.slice(hiddenCount);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo?.(0, scrollContainerRef.current.scrollHeight);
      }, 0);
    }
  }, [messages.length, isStreaming]);

  const handleScroll = useCallback((e) => {
    onScroll?.(e);
  }, [onScroll]);

  const handleExpand = useCallback(() => {
    // Signal to parent to show all messages
    onScroll?.({ detail: { expandAll: true } });
  }, [onScroll]);

  const containerStyle = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    ...style,
  }), [style]);

  const scrollStyle = useMemo(() => ({
    flex: 1,
    overflow: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }), []);

  return (
    <div
      ref={scrollContainerRef}
      style={containerStyle}
      role="log"
      aria-label="Chat conversation"
      {...props}
    >
      <div style={scrollStyle} onScroll={handleScroll}>
        {hiddenCount > 0 && (
          <HiddenBanner
            hiddenCount={hiddenCount}
            onExpand={handleExpand}
          />
        )}

        {visibleMessages.map((message, index) => (
          <Message
            key={`${message.timestamp}-${index}`}
            message={message}
            markdownComponents={markdownComponents}
          />
        ))}

        {isStreaming && <StreamingIndicator />}

        {children}
      </div>
    </div>
  );
});

ChatThread.displayName = 'ChatThread';

// Attach sub-components
ChatThread.Message = Message;
ChatThread.StreamingIndicator = StreamingIndicator;
ChatThread.HiddenBanner = HiddenBanner;

export default memo(ChatThread);
export { Message as ChatMessage, StreamingIndicator, HiddenBanner };
