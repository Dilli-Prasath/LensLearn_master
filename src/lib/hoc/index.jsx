/**
 * @module hoc
 * @description Higher-Order Components for cross-cutting concerns
 */

import React from 'react';
import { createEventEmitter } from '../utils/index.js';

/**
 * Error Boundary HOC
 * Wraps a component in an error boundary to catch errors
 * @param {React.ComponentType} Component - Component to wrap
 * @param {React.ComponentType} [FallbackComponent] - Fallback UI on error
 * @returns {React.ComponentType} Wrapped component
 *
 * @example
 * const SafeComponent = withErrorBoundary(MyComponent, ErrorFallback);
 */
export function withErrorBoundary(Component, FallbackComponent) {
  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        hasError: false,
        error: null,
        errorInfo: null,
      };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
      this.setState({
        error,
        errorInfo,
      });

      // Log error for debugging
      console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    };

    render() {
      if (this.state.hasError) {
        if (FallbackComponent) {
          return (
            <FallbackComponent
              error={this.state.error}
              reset={this.handleReset}
              errorInfo={this.state.errorInfo}
            />
          );
        }

        return (
          <div
            style={{
              padding: '20px',
              border: '1px solid #ff6b6b',
              borderRadius: '8px',
              backgroundColor: '#ffe0e0',
              color: '#c92a2a',
            }}
          >
            <h2>Something went wrong</h2>
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
            <button
              onClick={this.handleReset}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#c92a2a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        );
      }

      return <Component {...this.props} />;
    }
  }

  ErrorBoundary.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return ErrorBoundary;
}

/**
 * Accessibility HOC
 * Adds ARIA attributes, keyboard handlers, and focus management
 * @param {React.ComponentType} Component - Component to wrap
 * @param {Object} [options] - Configuration options
 * @param {string} [options.role] - ARIA role
 * @param {string} [options.label] - Accessible label
 * @param {boolean} [options.focusable=true] - Make component focusable
 * @param {Function} [options.onKeyDown] - Custom keyboard handler
 * @returns {React.ComponentType} Wrapped component
 *
 * @example
 * const A11yButton = withAccessibility(MyButton, { role: 'button', label: 'Submit' });
 */
export function withAccessibility(Component, options = {}) {
  const {
    role,
    label,
    focusable = true,
    onKeyDown: customKeyDown,
  } = options;

  const WrappedComponent = React.forwardRef((props, ref) => {
    const localRef = React.useRef();
    const componentRef = ref || localRef;

    // Focus management
    React.useEffect(() => {
      if (focusable && componentRef.current) {
        componentRef.current.addEventListener('focus', handleFocus);
        componentRef.current.addEventListener('blur', handleBlur);
        return () => {
          componentRef.current?.removeEventListener('focus', handleFocus);
          componentRef.current?.removeEventListener('blur', handleBlur);
        };
      }
    }, [componentRef]);

    const handleFocus = (e) => {
      e.target.setAttribute('data-focused', 'true');
      props.onFocus?.(e);
    };

    const handleBlur = (e) => {
      e.target.setAttribute('data-focused', 'false');
      props.onBlur?.(e);
    };

    const handleKeyDown = (e) => {
      // Common keyboard shortcuts
      if (e.key === 'Escape') {
        e.target.blur?.();
      }

      customKeyDown?.(e);
      props.onKeyDown?.(e);
    };

    const a11yProps = {
      ...props,
      ref: componentRef,
      onKeyDown: handleKeyDown,
    };

    if (role) {
      a11yProps.role = role;
    }
    if (label) {
      a11yProps['aria-label'] = label;
    }
    if (focusable) {
      a11yProps.tabIndex = 0;
    }

    return <Component {...a11yProps} />;
  });

  WrappedComponent.displayName = `withAccessibility(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * Analytics HOC
 * Tracks component renders, clicks, and timing
 * Emits events to a global analytics emitter
 * @param {React.ComponentType} Component - Component to wrap
 * @param {string} [eventName] - Name for analytics events
 * @returns {React.ComponentType} Wrapped component
 *
 * @example
 * const TrackedButton = withAnalytics(MyButton, 'button_click');
 * // Analytics events: 'button_click:render', 'button_click:click', etc.
 */
export function withAnalytics(Component, eventName = 'component') {
  const WrappedComponent = React.forwardRef((props, ref) => {
    const [renderTime] = React.useState(Date.now());
    const analyticsRef = React.useRef({
      eventName,
      renderTime,
      interactionCount: 0,
    });

    // Track component mount
    React.useEffect(() => {
      const duration = Date.now() - renderTime;
      if (typeof window !== 'undefined' && window.__analyticsEmitter) {
        window.__analyticsEmitter.emit(`${eventName}:mount`, {
          timestamp: renderTime,
          renderDuration: duration,
        });
      }

      return () => {
        if (typeof window !== 'undefined' && window.__analyticsEmitter) {
          window.__analyticsEmitter.emit(`${eventName}:unmount`, {
            timestamp: Date.now(),
            interactionCount: analyticsRef.current.interactionCount,
          });
        }
      };
    }, [renderTime]);

    const handleClick = (e) => {
      analyticsRef.current.interactionCount += 1;
      if (typeof window !== 'undefined' && window.__analyticsEmitter) {
        window.__analyticsEmitter.emit(`${eventName}:click`, {
          timestamp: Date.now(),
          x: e.clientX,
          y: e.clientY,
          interactionCount: analyticsRef.current.interactionCount,
        });
      }
      props.onClick?.(e);
    };

    const wrappedProps = {
      ...props,
      onClick: handleClick,
    };

    if (ref) {
      wrappedProps.ref = ref;
    }

    return <Component {...wrappedProps} />;
  });

  WrappedComponent.displayName = `withAnalytics(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * Initialize global analytics emitter
 * Call this once in your app root
 * @returns {void}
 *
 * @example
 * import { initAnalytics } from './lib/hoc';
 * initAnalytics();
 */
export function initAnalytics() {
  if (typeof window !== 'undefined' && !window.__analyticsEmitter) {
    window.__analyticsEmitter = createEventEmitter();
  }
}

/**
 * Get the global analytics emitter
 * @returns {Object} Analytics event emitter
 *
 * @example
 * const analytics = getAnalyticsEmitter();
 * analytics.on('button_click:click', (data) => console.log(data));
 */
export function getAnalyticsEmitter() {
  if (typeof window !== 'undefined' && window.__analyticsEmitter) {
    return window.__analyticsEmitter;
  }
  initAnalytics();
  return window.__analyticsEmitter;
}

/**
 * Lazy Load HOC
 * Loads component asynchronously with Suspense
 * @param {Function} importFn - Dynamic import function
 * @param {React.ComponentType} [FallbackComponent] - Loading UI
 * @returns {React.ComponentType} Lazy-loaded component
 *
 * @example
 * const LazyDashboard = withLazyLoad(
 *   () => import('./Dashboard'),
 *   LoadingSpinner
 * );
 */
export function withLazyLoad(importFn, FallbackComponent) {
  const LazyComponent = React.lazy(() =>
    importFn().catch((err) => {
      console.error('Failed to load component:', err);
      return { default: () => null };
    })
  );

  const WrappedComponent = (props) => (
    <React.Suspense
      fallback={
        FallbackComponent ? (
          <FallbackComponent />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        )
      }
    >
      <LazyComponent {...props} />
    </React.Suspense>
  );

  WrappedComponent.displayName = 'withLazyLoad';
  return WrappedComponent;
}

/**
 * Theme HOC
 * Provides theme context to wrapped component
 * @param {React.ComponentType} Component - Component to wrap
 * @param {string} [defaultTheme='light'] - Default theme
 * @returns {React.ComponentType} Wrapped component with theme support
 *
 * @example
 * const ThemedComponent = withTheme(MyComponent);
 */
export function withTheme(Component, defaultTheme = 'light') {
  const WrappedComponent = React.forwardRef((props, ref) => {
    const [theme, setTheme] = React.useState(defaultTheme);

    const toggleTheme = () => {
      setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const themeProps = {
      ...props,
      theme,
      toggleTheme,
      ref,
    };

    return <Component {...themeProps} />;
  });

  WrappedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * Data Fetching HOC
 * Handles loading, error, and data states
 * @param {React.ComponentType} Component - Component to wrap
 * @param {Function} fetchFn - Async function to fetch data
 * @returns {React.ComponentType} Wrapped component
 *
 * @example
 * const withData = (Component, fetchFn) => {
 *   return (props) => {
 *     const [data, setData] = React.useState(null);
 *     const [loading, setLoading] = React.useState(true);
 *     const [error, setError] = React.useState(null);
 *
 *     React.useEffect(() => {
 *       fetchFn()
 *         .then(setData)
 *         .catch(setError)
 *         .finally(() => setLoading(false));
 *     }, []);
 *
 *     return <Component data={data} loading={loading} error={error} {...props} />;
 *   };
 * };
 */
export function withData(Component, fetchFn) {
  const WrappedComponent = (props) => {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      let isMounted = true;

      const loadData = async () => {
        try {
          const result = await fetchFn();
          if (isMounted) {
            setData(result);
            setError(null);
          }
        } catch (err) {
          if (isMounted) {
            setError(err);
            setData(null);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      loadData();

      return () => {
        isMounted = false;
      };
    }, []);

    return (
      <Component
        data={data}
        loading={loading}
        error={error}
        {...props}
      />
    );
  };

  WrappedComponent.displayName = `withData(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

export default {
  withErrorBoundary,
  withAccessibility,
  withAnalytics,
  withLazyLoad,
  withTheme,
  withData,
  initAnalytics,
  getAnalyticsEmitter,
};
