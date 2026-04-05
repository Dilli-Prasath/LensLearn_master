/**
 * LanguageSelector - Dropdown language picker component
 *
 * A reusable language selector with customizable language list, icon, and keyboard support.
 * Handles click-outside detection and keyboard navigation automatically.
 *
 * Usage:
 *   <LanguageSelector
 *     value="en"
 *     onChange={(lang) => console.log(lang)}
 *     languages={[
 *       { code: 'en', name: 'English', flag: '🇬🇧' },
 *       { code: 'es', name: 'Spanish', flag: '🇪🇸' },
 *     ]}
 *   />
 *
 *   <LanguageSelector value={language} onChange={setLanguage} />
 */
import { forwardRef, memo, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

const DEFAULT_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'pl', name: 'Polish' },
];

const LanguageSelector = forwardRef(function LanguageSelector(
  {
    value = 'en',
    onChange,
    languages = DEFAULT_LANGUAGES,
    icon: IconComponent = Globe,
    style,
    ...props
  },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(
    languages.findIndex((lang) => lang.code === value) || 0
  );
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const currentLanguage = useMemo(
    () => languages[selectedIndex] || languages[0],
    [languages, selectedIndex]
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        !dropdownRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % languages.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + languages.length) % languages.length);
        break;
      case 'Enter':
        e.preventDefault();
        handleSelect(languages[selectedIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      default:
        break;
    }
  }, [isOpen, languages, selectedIndex]);

  const handleSelect = useCallback((language) => {
    setSelectedIndex(languages.indexOf(language));
    onChange?.(language.code);
    setIsOpen(false);
  }, [languages, onChange]);

  const containerStyle = useMemo(() => ({
    position: 'relative',
    display: 'inline-block',
    ...style,
  }), [style]);

  const buttonStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '8px 12px',
    minWidth: '120px',
    backgroundColor: 'var(--bg-tertiary, #334155)',
    color: 'var(--text-primary, #f1f5f9)',
    border: '1px solid var(--border-primary, #334155)',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    '&:hover': {
      backgroundColor: 'var(--bg-secondary, #1e293b)',
      borderColor: 'var(--accent-main, #6366f1)',
    },
    '&:focus': {
      boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
    },
  }), []);

  const dropdownStyle = useMemo(() => ({
    position: 'absolute',
    top: '100%',
    left: '0',
    marginTop: '6px',
    backgroundColor: 'var(--bg-secondary, #1e293b)',
    border: '1px solid var(--border-primary, #334155)',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    minWidth: '150px',
    maxHeight: '280px',
    overflow: 'auto',
    display: isOpen ? 'block' : 'none',
  }), [isOpen]);

  const itemStyle = (index) => ({
    display: 'flex',
    alignItems: 'center',
    justify: 'space-between',
    gap: '8px',
    padding: '10px 12px',
    backgroundColor: index === selectedIndex ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
    color: index === selectedIndex ? 'var(--accent-main, #6366f1)' : 'var(--text-secondary, #94a3b8)',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    fontSize: '0.875rem',
    '&:hover': {
      backgroundColor: 'rgba(99, 102, 241, 0.08)',
      color: 'var(--text-primary, #f1f5f9)',
    },
  });

  const iconStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }), []);

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      {...props}
    >
      <button
        ref={buttonRef}
        style={buttonStyle}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Language selector, currently ${currentLanguage.name}`}
      >
        <span style={iconStyle}>
          <IconComponent size={16} />
        </span>
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {currentLanguage.name}
        </span>
        <ChevronDown
          size={16}
          style={{
            transition: 'transform 200ms ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        />
      </button>

      <div
        ref={dropdownRef}
        style={dropdownStyle}
        role="listbox"
        aria-label="Language options"
      >
        {languages.map((language, index) => (
          <div
            key={language.code}
            style={itemStyle(index)}
            onClick={() => handleSelect(language)}
            onKeyDown={handleKeyDown}
            role="option"
            aria-selected={index === selectedIndex}
            tabIndex={isOpen ? 0 : -1}
          >
            <span style={{ flex: 1 }}>{language.name}</span>
            {index === selectedIndex && (
              <Check size={16} style={{ flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

LanguageSelector.displayName = 'LanguageSelector';

export default memo(LanguageSelector);
