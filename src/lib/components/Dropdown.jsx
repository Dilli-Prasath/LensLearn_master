/**
 * Dropdown - Generic dropdown menu component
 *
 * A flexible dropdown menu with keyboard navigation (arrow keys, Enter, Escape),
 * click-outside detection, and customizable alignment. Perfect for context menus,
 * action menus, and selector dropdowns.
 *
 * Usage:
 *   <Dropdown
 *     trigger={<Button>Actions</Button>}
 *     items={[
 *       { label: 'Edit', value: 'edit', icon: <EditIcon /> },
 *       { label: 'Delete', value: 'delete', icon: <TrashIcon /> },
 *     ]}
 *     onSelect={(value) => console.log(value)}
 *   />
 *
 *   <Dropdown
 *     trigger={<IconButton icon={<MoreIcon />} />}
 *     items={items}
 *     onSelect={handleAction}
 *     align="right"
 *     width="200px"
 *   />
 */
import { forwardRef, memo, useRef, useState, useCallback, useEffect, useMemo } from 'react';

const Dropdown = forwardRef(function Dropdown(
  {
    trigger,
    items = [],
    onSelect,
    align = 'left',
    width,
    style,
    ...props
  },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        !dropdownRef.current?.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Reset selected index when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setSelectedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case 'Home':
        e.preventDefault();
        setSelectedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setSelectedIndex(items.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          handleSelectItem(items[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      default:
        break;
    }
  }, [isOpen, items, selectedIndex]);

  const handleSelectItem = useCallback((item) => {
    onSelect?.(item.value, item);
    setIsOpen(false);
  }, [onSelect]);

  const containerStyle = useMemo(() => ({
    position: 'relative',
    display: 'inline-block',
    ...style,
  }), [style]);

  const triggerWrapperStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
  }), []);

  const dropdownStyle = useMemo(() => {
    const baseStyle = {
      position: 'absolute',
      top: '100%',
      marginTop: '6px',
      backgroundColor: 'var(--bg-secondary, #1e293b)',
      border: '1px solid var(--border-primary, #334155)',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      minWidth: width || '200px',
      maxHeight: '400px',
      overflow: 'auto',
      display: isOpen ? 'block' : 'none',
      padding: '4px 0',
    };

    if (align === 'right') {
      return { ...baseStyle, right: 0, left: 'auto' };
    }
    return { ...baseStyle, left: 0 };
  }, [isOpen, width, align]);

  const itemStyle = (index) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    backgroundColor: index === selectedIndex ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
    color: index === selectedIndex ? 'var(--accent-main, #6366f1)' : 'var(--text-secondary, #94a3b8)',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    fontSize: '0.875rem',
    lineHeight: 1.4,
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  });

  const iconStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '18px',
    height: '18px',
  }), []);

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      {...props}
    >
      {/* Trigger */}
      <div
        ref={triggerRef}
        style={triggerWrapperStyle}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {/* Dropdown Menu */}
      <div
        ref={dropdownRef}
        style={dropdownStyle}
        role="menu"
        onKeyDown={handleKeyDown}
      >
        {items.length === 0 ? (
          <div
            style={{
              padding: '12px 16px',
              color: 'var(--text-tertiary, #64748b)',
              fontSize: '0.8125rem',
              textAlign: 'center',
            }}
            role="status"
          >
            No options
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={`${item.value}-${index}`}
              style={itemStyle(index)}
              onClick={() => handleSelectItem(item)}
              onMouseEnter={() => setSelectedIndex(index)}
              role="menuitem"
              aria-selected={index === selectedIndex}
              tabIndex={isOpen && index === selectedIndex ? 0 : -1}
            >
              {item.icon && <div style={iconStyle}>{item.icon}</div>}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.active && (
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-main, #6366f1)',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

export default memo(Dropdown);
