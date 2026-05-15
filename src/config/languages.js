/**
 * Language Registry — Single source of truth for all supported languages.
 *
 * Languages are organized into tiers:
 *  - core: Always visible in quick-select dropdowns
 *  - extended: Visible in full language picker and settings
 *  - indian: Indian languages (extended set enabled in settings)
 *
 * To add a new language, just add an entry to the appropriate array.
 * All UI components read from this file.
 */

export const LANGUAGE_TIERS = {
  core: { label: 'Popular', color: '#6366f1' },
  extended: { label: 'World Languages', color: '#06b6d4' },
  indian: { label: 'Indian Languages', color: '#f59e0b' },
};

/**
 * Each language entry:
 *  - code: ISO 639-1 code (or custom short code for rare languages)
 *  - name: English name (used as the value stored in settings)
 *  - native: Name in the language's own script
 *  - tier: 'core' | 'extended' | 'indian'
 *  - enabled: default enabled state (user can toggle in settings)
 */
export const ALL_LANGUAGES = [
  // ─── Core (always available) ───
  { code: 'en', name: 'English', native: 'English', tier: 'core', enabled: true },
  { code: 'es', name: 'Spanish', native: 'Español', tier: 'core', enabled: true },
  { code: 'fr', name: 'French', native: 'Français', tier: 'core', enabled: true },
  { code: 'de', name: 'German', native: 'Deutsch', tier: 'core', enabled: true },
  { code: 'pt', name: 'Portuguese', native: 'Português', tier: 'core', enabled: true },
  { code: 'ar', name: 'Arabic', native: 'العربية', tier: 'core', enabled: true },
  { code: 'zh', name: 'Chinese', native: '中文', tier: 'core', enabled: true },
  { code: 'ja', name: 'Japanese', native: '日本語', tier: 'core', enabled: true },
  { code: 'ko', name: 'Korean', native: '한국어', tier: 'core', enabled: true },
  { code: 'ru', name: 'Russian', native: 'Русский', tier: 'core', enabled: true },

  // ─── Indian Languages ───
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', tier: 'indian', enabled: true },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', tier: 'indian', enabled: true },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', tier: 'indian', enabled: true },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', tier: 'indian', enabled: true },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', tier: 'indian', enabled: true },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', tier: 'indian', enabled: true },
  { code: 'mr', name: 'Marathi', native: 'मराठी', tier: 'indian', enabled: true },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', tier: 'indian', enabled: true },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', tier: 'indian', enabled: true },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', tier: 'indian', enabled: true },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', tier: 'indian', enabled: false },
  { code: 'ur', name: 'Urdu', native: 'اردو', tier: 'indian', enabled: true },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्', tier: 'indian', enabled: false },
  { code: 'ks', name: 'Kashmiri', native: 'कॉशुर', tier: 'indian', enabled: false },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي', tier: 'indian', enabled: false },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', tier: 'indian', enabled: false },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी', tier: 'indian', enabled: false },
  { code: 'doi', name: 'Dogri', native: 'डोगरी', tier: 'indian', enabled: false },
  { code: 'mai', name: 'Maithili', native: 'मैथिली', tier: 'indian', enabled: false },
  { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', tier: 'indian', enabled: false },
  { code: 'bho', name: 'Bhojpuri', native: 'भोजपुरी', tier: 'indian', enabled: false },
  { code: 'raj', name: 'Rajasthani', native: 'राजस्थानी', tier: 'indian', enabled: false },
  { code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন্', tier: 'indian', enabled: false },
  { code: 'brx', name: 'Bodo', native: 'बड़ो', tier: 'indian', enabled: false },
  { code: 'tcy', name: 'Tulu', native: 'ತುಳು', tier: 'indian', enabled: false },
  { code: 'gom', name: 'Goan Konkani', native: 'गोंयची कोंकणी', tier: 'indian', enabled: false },

  // ─── Extended World Languages ───
  { code: 'it', name: 'Italian', native: 'Italiano', tier: 'extended', enabled: true },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', tier: 'extended', enabled: true },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', tier: 'extended', enabled: true },
  { code: 'pl', name: 'Polish', native: 'Polski', tier: 'extended', enabled: true },
  { code: 'nl', name: 'Dutch', native: 'Nederlands', tier: 'extended', enabled: false },
  { code: 'sv', name: 'Swedish', native: 'Svenska', tier: 'extended', enabled: false },
  { code: 'da', name: 'Danish', native: 'Dansk', tier: 'extended', enabled: false },
  { code: 'no', name: 'Norwegian', native: 'Norsk', tier: 'extended', enabled: false },
  { code: 'fi', name: 'Finnish', native: 'Suomi', tier: 'extended', enabled: false },
  { code: 'el', name: 'Greek', native: 'Ελληνικά', tier: 'extended', enabled: false },
  { code: 'cs', name: 'Czech', native: 'Čeština', tier: 'extended', enabled: false },
  { code: 'ro', name: 'Romanian', native: 'Română', tier: 'extended', enabled: false },
  { code: 'hu', name: 'Hungarian', native: 'Magyar', tier: 'extended', enabled: false },
  { code: 'uk', name: 'Ukrainian', native: 'Українська', tier: 'extended', enabled: false },
  { code: 'th', name: 'Thai', native: 'ไทย', tier: 'extended', enabled: true },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', tier: 'extended', enabled: true },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu', tier: 'extended', enabled: false },
  { code: 'tl', name: 'Filipino', native: 'Filipino', tier: 'extended', enabled: false },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili', tier: 'extended', enabled: true },
  { code: 'am', name: 'Amharic', native: 'አማርኛ', tier: 'extended', enabled: false },
  { code: 'ha', name: 'Hausa', native: 'Hausa', tier: 'extended', enabled: false },
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá', tier: 'extended', enabled: false },
  { code: 'zu', name: 'Zulu', native: 'isiZulu', tier: 'extended', enabled: false },
  { code: 'he', name: 'Hebrew', native: 'עברית', tier: 'extended', enabled: false },
  { code: 'fa', name: 'Persian', native: 'فارسی', tier: 'extended', enabled: false },
  { code: 'my', name: 'Burmese', native: 'မြန်မာ', tier: 'extended', enabled: false },
  { code: 'km', name: 'Khmer', native: 'ខ្មែរ', tier: 'extended', enabled: false },
  { code: 'lo', name: 'Lao', native: 'ລາວ', tier: 'extended', enabled: false },
  { code: 'si', name: 'Sinhala', native: 'සිංහල', tier: 'extended', enabled: false },
  { code: 'ka', name: 'Georgian', native: 'ქართული', tier: 'extended', enabled: false },
  { code: 'hy', name: 'Armenian', native: 'Հայերեն', tier: 'extended', enabled: false },
  { code: 'az', name: 'Azerbaijani', native: 'Azərbaycan', tier: 'extended', enabled: false },
  { code: 'uz', name: 'Uzbek', native: "O'zbek", tier: 'extended', enabled: false },
  { code: 'kk', name: 'Kazakh', native: 'Қазақ', tier: 'extended', enabled: false },
  { code: 'mn', name: 'Mongolian', native: 'Монгол', tier: 'extended', enabled: false },
];

/**
 * Get enabled languages (core + user-enabled from settings).
 * @param {string[]} enabledCodes - Language codes enabled by user in settings
 * @returns {Array} Filtered language entries
 */
export function getEnabledLanguages(enabledCodes = null) {
  if (!enabledCodes) {
    // Default: return languages marked as enabled by default
    return ALL_LANGUAGES.filter(l => l.enabled);
  }
  // Return core (always on) + user-enabled
  return ALL_LANGUAGES.filter(l => l.tier === 'core' || enabledCodes.includes(l.code));
}

/**
 * Get all languages grouped by tier for settings UI.
 */
export function getLanguagesByTier() {
  const groups = {};
  for (const lang of ALL_LANGUAGES) {
    if (!groups[lang.tier]) groups[lang.tier] = [];
    groups[lang.tier].push(lang);
  }
  return groups;
}

/**
 * Get language name list for dropdowns (backward-compatible with existing code).
 * @param {string[]} enabledCodes - Optional language codes enabled by user
 * @returns {string[]} Array of language name strings
 */
export function getLanguageNames(enabledCodes = null) {
  return getEnabledLanguages(enabledCodes).map(l => l.name);
}

/**
 * Find language entry by name or code.
 */
export function findLanguage(nameOrCode) {
  const lower = (nameOrCode || '').toLowerCase();
  return ALL_LANGUAGES.find(l => l.name.toLowerCase() === lower || l.code === lower);
}
