/**
 * LensLearn - Text-to-Speech Service
 * Reads explanations aloud for accessibility and hands-free learning
 */

class SpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.speaking = false;
    this.paused = false;
    this.currentUtterance = null;
    this.voices = [];
    this._loadVoices();
  }

  _loadVoices() {
    const load = () => {
      this.voices = this.synth.getVoices();
    };
    load();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = load;
    }
  }

  /**
   * Find the best voice for a given language
   */
  _getVoice(lang = 'en') {
    const langMap = {
      'English': 'en', 'Tamil': 'ta', 'Hindi': 'hi',
      'Spanish': 'es', 'French': 'fr', 'German': 'de',
      'Portuguese': 'pt', 'Arabic': 'ar', 'Bengali': 'bn',
      'Chinese': 'zh', 'Japanese': 'ja', 'Korean': 'ko',
    };

    const code = langMap[lang] || lang;

    // Prefer Google voices, then any matching voice
    const googleVoice = this.voices.find(v => v.lang.startsWith(code) && v.name.includes('Google'));
    if (googleVoice) return googleVoice;

    return this.voices.find(v => v.lang.startsWith(code)) || this.voices[0];
  }

  /**
   * Speak text aloud
   */
  speak(text, options = {}) {
    const { language = 'English', rate = 0.9, pitch = 1, onEnd = null } = options;

    this.stop();

    // Clean markdown from text
    const clean = text
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[-*+]\s/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.voice = this._getVoice(language);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onstart = () => { this.speaking = true; this.paused = false; };
    utterance.onend = () => { this.speaking = false; this.paused = false; onEnd?.(); };
    utterance.onerror = () => { this.speaking = false; this.paused = false; };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  pause() {
    if (this.speaking && !this.paused) {
      this.synth.pause();
      this.paused = true;
    }
  }

  resume() {
    if (this.paused) {
      this.synth.resume();
      this.paused = false;
    }
  }

  stop() {
    this.synth.cancel();
    this.speaking = false;
    this.paused = false;
  }

  togglePause() {
    if (this.paused) this.resume();
    else if (this.speaking) this.pause();
  }

  getState() {
    return { speaking: this.speaking, paused: this.paused };
  }

  getAvailableLanguages() {
    const langs = new Set(this.voices.map(v => v.lang.split('-')[0]));
    return Array.from(langs);
  }
}

const speechService = new SpeechService();
export default speechService;
