/**
 * LensLearn - Cache Service
 * Manages offline caching of explanations, quizzes, and flashcards
 * Uses localStorage with FIFO eviction policy
 */

const CACHE_KEY = 'lenslearn-cache';
const MAX_CACHE_ITEMS = 20;

class CacheService {
  constructor() {
    this.cache = this.loadCache();
  }

  /**
   * Load cache from localStorage
   */
  loadCache() {
    try {
      const data = localStorage.getItem(CACHE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Failed to load cache:', err);
      return [];
    }
  }

  /**
   * Save cache to localStorage
   */
  _saveCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
    } catch (err) {
      console.error('Failed to save cache:', err);
    }
  }

  /**
   * Generate a simple hash from base64 string using djb2 algorithm
   * Uses first 1000 characters of base64 to keep hash generation fast
   */
  generateImageHash(base64) {
    const sample = base64.substring(0, 1000);
    let hash = 5381;
    for (let i = 0; i < sample.length; i++) {
      hash = ((hash << 5) + hash) + sample.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Cache an explanation with associated quiz and flashcards
   */
  cacheExplanation(imageHash, explanation, quiz = null, flashcards = null) {
    // Check if already cached
    const existingIndex = this.cache.findIndex(item => item.imageHash === imageHash);
    if (existingIndex !== -1) {
      // Update existing entry - move to front
      this.cache.splice(existingIndex, 1);
    }

    // Add new entry to front (most recent)
    const cacheEntry = {
      imageHash,
      explanation,
      quiz,
      flashcards,
      timestamp: new Date().toISOString()
    };

    this.cache.unshift(cacheEntry);

    // Enforce max cache size - FIFO eviction (remove oldest)
    if (this.cache.length > MAX_CACHE_ITEMS) {
      this.cache = this.cache.slice(0, MAX_CACHE_ITEMS);
    }

    this._saveCache();
    return cacheEntry;
  }

  /**
   * Retrieve a cached explanation by image hash
   */
  getCachedExplanation(imageHash) {
    const cached = this.cache.find(item => item.imageHash === imageHash);
    return cached || null;
  }

  /**
   * Get the number of cached items
   */
  getCacheSize() {
    return this.cache.length;
  }

  /**
   * Get all cached items (for debugging/management)
   */
  getAllCached() {
    return [...this.cache];
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache = [];
    this._saveCache();
  }

  /**
   * Delete a specific cached item by image hash
   */
  deleteCached(imageHash) {
    this.cache = this.cache.filter(item => item.imageHash !== imageHash);
    this._saveCache();
  }

  /**
   * Get cache storage stats
   */
  getCacheStats() {
    let totalSize = 0;
    try {
      totalSize = new Blob([JSON.stringify(this.cache)]).size;
    } catch (err) {
      console.error('Failed to calculate cache size:', err);
    }

    return {
      itemCount: this.cache.length,
      maxItems: MAX_CACHE_ITEMS,
      estimatedSizeBytes: totalSize,
      estimatedSizeKB: Math.round(totalSize / 1024 * 100) / 100
    };
  }
}

const cacheService = new CacheService();
export default cacheService;
