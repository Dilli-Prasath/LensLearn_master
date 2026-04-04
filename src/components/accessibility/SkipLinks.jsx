/**
 * SkipLinks — Keyboard-first navigation.
 * Hidden by default, visible on Tab focus.
 * Allows screen reader / keyboard users to skip to main content.
 */
export default function SkipLinks() {
  return (
    <nav aria-label="Skip navigation" className="skip-links">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#bottom-nav" className="skip-link">
        Skip to navigation
      </a>
    </nav>
  );
}
