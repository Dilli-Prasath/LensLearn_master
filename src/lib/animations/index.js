/**
 * @module animations
 * @description Comprehensive CSS-in-JS animation system with keyframe definitions and helpers
 */

/**
 * Keyframe definitions for various animations
 * Each keyframe object defines the animation states and timing
 */
export const keyframes = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  slideUp: {
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  slideInLeft: {
    from: { opacity: 0, transform: 'translateX(-30px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
  slideInRight: {
    from: { opacity: 0, transform: 'translateX(30px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
  bounceIn: {
    '0%': { opacity: 0, transform: 'scale(0.3)' },
    '50%': { opacity: 1, transform: 'scale(1.05)' },
    '70%': { transform: 'scale(0.9)' },
    '100%': { transform: 'scale(1)' },
  },
  popIn: {
    '0%': { opacity: 0, transform: 'scale(0) rotate(-45deg)' },
    '100%': { opacity: 1, transform: 'scale(1) rotate(0deg)' },
  },
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
  pulse: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
  },
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  shimmer: {
    '0%': { backgroundPosition: '-1000px 0' },
    '100%': { backgroundPosition: '1000px 0' },
  },
  breathe: {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' },
  },
  dotBounce: {
    '0%, 80%, 100%': { transform: 'translateY(0)', opacity: 1 },
    '40%': { transform: 'translateY(-10px)', opacity: 0.7 },
  },
  confettiFall: {
    '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: 1 },
    '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: 0 },
  },
  headShake: {
    '0%, 50%': { transform: 'translateX(0)' },
    '6.5%': { transform: 'translateX(-6px) rotateY(-9deg)' },
    '18.5%': { transform: 'translateX(5px) rotateY(7deg)' },
    '31.5%': { transform: 'translateX(-8px) rotateY(-8deg)' },
    '43.5%': { transform: 'translateX(8px) rotateY(8deg)' },
  },
  ripplePulse: {
    '0%': { transform: 'scale(0)', opacity: 1 },
    '100%': { transform: 'scale(4)', opacity: 0 },
  },
  float: {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
  },
  glow: {
    '0%, 100%': { boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)' },
    '50%': { boxShadow: '0 0 20px rgba(255, 255, 255, 1)' },
  },
  morphBlob: {
    '0%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
    '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
    '100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
  },
  orbitSpin: {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  gradientShift: {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
  scanLine: {
    '0%': { transform: 'translateY(-100%)' },
    '100%': { transform: 'translateY(100%)' },
  },
};

/**
 * Convert keyframe object to CSS string
 * @param {string} name - Animation name
 * @param {Object} frames - Keyframe object
 * @returns {string} CSS @keyframes rule
 */
function keyframeToCSS(name, frames) {
  const frameRules = Object.entries(frames)
    .map(([key, styles]) => {
      const styleString = Object.entries(styles)
        .map(([prop, value]) => {
          // Convert camelCase to kebab-case
          const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
          return `${cssProp}: ${value}`;
        })
        .join('; ');
      return `  ${key} { ${styleString}; }`;
    })
    .join('\n');

  return `@keyframes ${name} {\n${frameRules}\n}`;
}

/**
 * Generate all keyframe CSS rules as a single string
 * Inject this once into your application (e.g., in a <style> tag or CSS-in-JS setup)
 */
export const keyframeCSS = Object.entries(keyframes)
  .map(([name, frames]) => keyframeToCSS(name, frames))
  .join('\n\n');

/**
 * Create an animation style object
 * @param {string} name - Animation name (key from keyframes object)
 * @param {number} [duration=1] - Duration in seconds
 * @param {string} [easing='ease-in-out'] - CSS easing function
 * @param {number} [delay=0] - Delay in seconds
 * @param {string} [fillMode='forwards'] - CSS animation-fill-mode
 * @param {number} [iterationCount=1] - Number of times to run
 * @returns {Object} Style object with animation property
 *
 * @example
 * const style = animate('fadeIn', 0.5, 'ease-out');
 * // { animation: 'fadeIn 0.5s ease-out 0s forwards 1' }
 */
export function animate(
  name,
  duration = 1,
  easing = 'ease-in-out',
  delay = 0,
  fillMode = 'forwards',
  iterationCount = 1
) {
  return {
    animation: `${name} ${duration}s ${easing} ${delay}s ${fillMode} ${iterationCount}`,
  };
}

/**
 * Create staggered animation delay
 * Useful for animating lists or grids of elements sequentially
 * @param {number} index - Element index in the sequence
 * @param {number} [baseDelay=0.06] - Base delay per element in seconds
 * @returns {Object} Style object with animationDelay property
 *
 * @example
 * items.map((item, i) => ({
 *   ...animate('slideUp', 0.5),
 *   ...stagger(i, 0.1)
 * }))
 */
export function stagger(index, baseDelay = 0.06) {
  return {
    animationDelay: `${index * baseDelay}s`,
  };
}

/**
 * Combine multiple animation style objects
 * @param {...Object} animations - Animation style objects
 * @returns {Object} Merged animation styles
 *
 * @example
 * combineAnimations(
 *   animate('slideUp', 0.5),
 *   { transform: 'scale(1.1)' }
 * )
 */
export function combineAnimations(...animations) {
  return Object.assign({}, ...animations);
}

/**
 * Create a pulsing animation (useful for loading states, notifications)
 * @param {number} [duration=2] - Duration in seconds
 * @returns {Object} Style object with pulsing animation
 */
export function createPulseAnimation(duration = 2) {
  return animate('pulse', duration, 'ease-in-out', 0, 'forwards', 'infinite');
}

/**
 * Create a spinning animation (useful for loaders)
 * @param {number} [duration=1] - Duration in seconds
 * @param {string} [direction='normal'] - 'normal' or 'reverse'
 * @returns {Object} Style object with spinning animation
 */
export function createSpinAnimation(duration = 1, direction = 'normal') {
  return {
    animation: `spin ${duration}s linear 0s forwards infinite`,
    animationDirection: direction,
  };
}

/**
 * Create a breathing animation (for subtle movement)
 * @param {number} [duration=3] - Duration in seconds
 * @returns {Object} Style object with breathing animation
 */
export function createBreatheAnimation(duration = 3) {
  return animate('breathe', duration, 'ease-in-out', 0, 'forwards', 'infinite');
}

/**
 * Create a floating animation
 * @param {number} [duration=4] - Duration in seconds
 * @param {number} [distance=10] - Float distance in pixels
 * @returns {Object} Style object with floating animation
 */
export function createFloatAnimation(duration = 4, distance = 10) {
  return {
    animation: `float ${duration}s ease-in-out 0s forwards infinite`,
    animationTimingFunction: 'ease-in-out',
  };
}

/**
 * Create a shimmer/skeleton loading animation
 * @param {number} [duration=2] - Duration in seconds
 * @returns {Object} Style object with shimmer animation
 */
export function createShimmerAnimation(duration = 2) {
  return {
    backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    backgroundSize: '200% 100%',
    animation: `shimmer ${duration}s infinite`,
  };
}

/**
 * Preload animations by injecting keyframe CSS
 * Call this once in your app initialization
 * @returns {void}
 *
 * @example
 * // In your main App component or initialization
 * preloadAnimations();
 */
export function preloadAnimations() {
  if (typeof document !== 'undefined') {
    // Check if keyframes are already injected
    if (!document.getElementById('lenslearn-keyframes')) {
      const style = document.createElement('style');
      style.id = 'lenslearn-keyframes';
      style.textContent = keyframeCSS;
      document.head.appendChild(style);
    }
  }
}

export default {
  keyframes,
  keyframeCSS,
  animate,
  stagger,
  combineAnimations,
  createPulseAnimation,
  createSpinAnimation,
  createBreatheAnimation,
  createFloatAnimation,
  createShimmerAnimation,
  preloadAnimations,
};
