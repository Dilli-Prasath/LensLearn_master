/**
 * LensLearn - History Service
 * Manages saved scan sessions with localStorage persistence
 */

const HISTORY_KEY = 'lenslearn-history';
const MAX_SESSIONS = 50;

class HistoryService {
  constructor() {
    this.sessions = this.loadSessions();
  }

  /**
   * Load sessions from localStorage
   */
  loadSessions() {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Failed to load history:', err);
      return [];
    }
  }

  /**
   * Save all sessions to localStorage
   */
  _saveSessions() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(this.sessions));
    } catch (err) {
      console.error('Failed to save history:', err);
    }
  }

  /**
   * Save a new session
   */
  saveSession(image, explanation, subject, language, quiz) {
    const session = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      image,
      explanation,
      subject: subject || this.detectSubject(explanation),
      language,
      quiz: quiz || null,
    };

    this.sessions.unshift(session);

    // Keep only last MAX_SESSIONS
    if (this.sessions.length > MAX_SESSIONS) {
      this.sessions = this.sessions.slice(0, MAX_SESSIONS);
    }

    this._saveSessions();
    return session;
  }

  /**
   * Get all sessions
   */
  getSessions() {
    return this.sessions;
  }

  /**
   * Get a single session by ID
   */
  getSession(id) {
    return this.sessions.find(s => s.id === id);
  }

  /**
   * Delete a session
   */
  deleteSession(id) {
    this.sessions = this.sessions.filter(s => s.id !== id);
    this._saveSessions();
  }

  /**
   * Delete all sessions
   */
  clearHistory() {
    this.sessions = [];
    this._saveSessions();
  }

  /**
   * Get statistics about learning
   */
  getStats() {
    const totalScans = this.sessions.length;
    const todayDate = new Date().toDateString();
    const todayScans = this.sessions.filter(
      s => new Date(s.timestamp).toDateString() === todayDate
    ).length;

    // Calculate quiz score average
    const quizzes = this.sessions
      .filter(s => s.quiz)
      .map(s => {
        const correct = s.quiz.questions?.filter(q => q.userAnswer === q.correct).length || 0;
        const total = s.quiz.questions?.length || 1;
        return (correct / total) * 100;
      });
    const avgQuizScore = quizzes.length > 0
      ? Math.round(quizzes.reduce((a, b) => a + b) / quizzes.length)
      : 0;

    // Count unique languages used
    const languages = new Set(this.sessions.map(s => s.language));

    // Calculate study streak (consecutive days with scans)
    let streak = 0;
    let currentDate = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = currentDate.toDateString();
      const hasScans = this.sessions.some(
        s => new Date(s.timestamp).toDateString() === dateStr
      );
      if (hasScans) {
        streak++;
      } else if (i > 0) {
        break;
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return {
      totalScans,
      todayScans,
      avgQuizScore,
      languagesUsed: languages.size,
      studyStreak: streak,
    };
  }

  /**
   * Get sessions filtered by subject
   */
  getSessionsBySubject(subject) {
    return this.sessions.filter(s =>
      s.subject.toLowerCase().includes(subject.toLowerCase())
    );
  }

  /**
   * Auto-detect subject from explanation
   */
  detectSubject(text) {
    const subjects = {
      math: ['equation', 'algebra', 'geometry', 'calculus', 'number', 'solve', 'formula', 'derivative', 'integral', 'matrix'],
      science: ['atom', 'molecule', 'reaction', 'energy', 'force', 'physics', 'chemistry', 'biology', 'cell', 'organism'],
      english: ['literature', 'grammar', 'vocabulary', 'sentence', 'paragraph', 'write', 'author', 'poem', 'narrative'],
      history: ['war', 'period', 'revolution', 'century', 'empire', 'historical', 'ancient', 'medieval', 'modern'],
    };

    const lower = text.toLowerCase();
    let bestMatch = 'General';
    let maxMatches = 0;

    Object.entries(subjects).forEach(([subject, keywords]) => {
      const matches = keywords.filter(k => lower.includes(k)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = subject.charAt(0).toUpperCase() + subject.slice(1);
      }
    });

    return bestMatch;
  }
}

const historyService = new HistoryService();
export default historyService;
