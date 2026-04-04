/**
 * VoiceControl — Hands-free navigation via Web Speech Recognition.
 * Supports commands like "go home", "scan", "read aloud", "scroll down".
 *
 * For: blind users, motor-impaired users, anyone who can't touch the screen.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibilityStore, useScanStore, useSettingsStore } from '../../store';
import speechService from '../../services/speechService';
import { announce } from './ScreenReaderAnnouncer';

const COMMANDS = {
  // Navigation
  'go home': '/',
  'home': '/',
  'go scan': '/scan',
  'scan': '/scan',
  'open camera': '/scan',
  'take photo': '/scan',
  'go subjects': '/subjects',
  'subjects': '/subjects',
  'go history': '/history',
  'history': '/history',
  'go settings': '/settings',
  'settings': '/settings',
  'go back': -1,
  'back': -1,

  // Actions
  'read aloud': 'ACTION_READ',
  'read': 'ACTION_READ',
  'stop reading': 'ACTION_STOP_READ',
  'stop': 'ACTION_STOP_READ',
  'scroll down': 'ACTION_SCROLL_DOWN',
  'scroll up': 'ACTION_SCROLL_UP',
  'explain': 'ACTION_EXPLAIN',
  'quiz': 'ACTION_QUIZ',
  'flashcards': 'ACTION_FLASHCARDS',

  // Accessibility
  'bigger text': 'ACTION_TEXT_BIGGER',
  'smaller text': 'ACTION_TEXT_SMALLER',
  'help': 'ACTION_HELP',
};

export default function VoiceControl() {
  const enabled = useAccessibilityStore((s) => s.voiceControlEnabled);
  const voiceLang = useAccessibilityStore((s) => s.voiceLanguage);
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const explanation = useScanStore((s) => s.explanation);
  const language = useSettingsStore((s) => s.language);

  const executeCommand = useCallback((transcript) => {
    const lower = transcript.toLowerCase().trim();
    setLastCommand(lower);

    // Check exact command matches
    for (const [phrase, action] of Object.entries(COMMANDS)) {
      if (lower.includes(phrase)) {
        // Navigation commands
        if (typeof action === 'string' && action.startsWith('/')) {
          announce(`Navigating to ${phrase}`);
          navigate(action);
          return;
        }
        if (action === -1) {
          announce('Going back');
          navigate(-1);
          return;
        }

        // Action commands
        switch (action) {
          case 'ACTION_READ':
            if (explanation) {
              announce('Reading explanation aloud');
              speechService.speak(explanation, { language });
            } else {
              announce('No explanation to read. Scan something first.');
            }
            return;
          case 'ACTION_STOP_READ':
            speechService.stop();
            announce('Stopped reading');
            return;
          case 'ACTION_SCROLL_DOWN':
            document.querySelector('.page')?.scrollBy({ top: 300, behavior: 'smooth' });
            return;
          case 'ACTION_SCROLL_UP':
            document.querySelector('.page')?.scrollBy({ top: -300, behavior: 'smooth' });
            return;
          case 'ACTION_EXPLAIN':
            navigate('/scan');
            announce('Opening scan page. Capture or upload an image to get an explanation.');
            return;
          case 'ACTION_QUIZ':
            navigate('/quiz');
            announce('Opening quiz');
            return;
          case 'ACTION_FLASHCARDS':
            navigate('/flashcards');
            announce('Opening flashcards');
            return;
          case 'ACTION_TEXT_BIGGER': {
            const sizes = ['small', 'medium', 'large', 'xlarge'];
            const current = useAccessibilityStore.getState().textSize;
            const idx = sizes.indexOf(current);
            if (idx < sizes.length - 1) {
              useAccessibilityStore.getState().setSetting('textSize', sizes[idx + 1]);
              announce(`Text size: ${sizes[idx + 1]}`);
            } else {
              announce('Text is already at maximum size');
            }
            return;
          }
          case 'ACTION_TEXT_SMALLER': {
            const sizes = ['small', 'medium', 'large', 'xlarge'];
            const current = useAccessibilityStore.getState().textSize;
            const idx = sizes.indexOf(current);
            if (idx > 0) {
              useAccessibilityStore.getState().setSetting('textSize', sizes[idx - 1]);
              announce(`Text size: ${sizes[idx - 1]}`);
            } else {
              announce('Text is already at minimum size');
            }
            return;
          }
          case 'ACTION_HELP':
            announce(
              'Voice commands available: go home, scan, subjects, history, settings, go back, ' +
              'read aloud, stop reading, scroll down, scroll up, bigger text, smaller text, quiz, flashcards'
            );
            return;
        }
      }
    }

    announce(`Command not recognized: ${lower}. Say "help" for available commands.`);
  }, [navigate, explanation, language]);

  useEffect(() => {
    if (!enabled) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
        setIsListening(false);
      }
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      announce('Voice control is not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = voiceLang;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if still enabled
      if (useAccessibilityStore.getState().voiceControlEnabled) {
        try { recognition.start(); } catch { /* already started */ }
      }
    };
    recognition.onerror = (e) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('Voice control error:', e.error);
      }
    };
    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        executeCommand(last[0].transcript);
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch { /* */ }

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [enabled, voiceLang, executeCommand]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 14px', borderRadius: 20,
        background: isListening ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
        border: `1px solid ${isListening ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
        backdropFilter: 'blur(12px)',
        fontSize: 11, fontWeight: 600,
        color: isListening ? '#10b981' : '#ef4444',
        pointerEvents: 'none',
        transition: 'all 0.3s',
      }}
    >
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: isListening ? '#10b981' : '#ef4444',
        animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none',
      }} />
      {isListening ? (lastCommand ? `"${lastCommand}"` : 'Listening...') : 'Voice off'}
    </div>
  );
}
