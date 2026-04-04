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
  getVoice(lang = 'English') {
    const langMap = {
      'English': 'en-US', 'Tamil': 'ta-IN', 'Hindi': 'hi-IN',
      'Spanish': 'es-ES', 'French': 'fr-FR', 'German': 'de-DE',
      'Portuguese': 'pt-BR', 'Arabic': 'ar-SA', 'Bengali': 'bn-IN',
      'Chinese': 'zh-CN', 'Japanese': 'ja-JP', 'Korean': 'ko-KR',
      'Indonesian': 'id-ID', 'Swahili': 'sw-KE', 'Russian': 'ru-RU',
    };

    const targetCode = langMap[lang] || 'en-US';
    const langPrefix = targetCode.split('-')[0];

    // Try exact match first
    let voice = this.voices.find(v => v.lang === targetCode);
    if (voice) return voice;

    // Then try language prefix match
    voice = this.voices.find(v => v.lang.startsWith(langPrefix));
    if (voice) return voice;

    // Fallback to first available voice
    return this.voices[0] || null;
  }

  _getVoice(lang = 'en') {
    return this.getVoice(typeof lang === 'string' && lang.length > 2 ? lang : 'English');
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

    const langMap = {
      'English': 'en-US', 'Tamil': 'ta-IN', 'Hindi': 'hi-IN',
      'Spanish': 'es-ES', 'French': 'fr-FR', 'German': 'de-DE',
      'Portuguese': 'pt-BR', 'Arabic': 'ar-SA', 'Bengali': 'bn-IN',
      'Chinese': 'zh-CN', 'Japanese': 'ja-JP', 'Korean': 'ko-KR',
      'Indonesian': 'id-ID', 'Swahili': 'sw-KE', 'Russian': 'ru-RU',
    };

    const utterance = new SpeechSynthesisUtterance(clean);
    const selectedVoice = this._getVoice(language);
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice?.lang || langMap[language] || 'en-US';
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
