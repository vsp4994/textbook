import { type ReactNode, useEffect } from 'react';
import { Icon } from './Icon';

/**
 * Supported notification severities. The parent only picks which one to show
 * ("success", "error", or "info"); the matching filled icon and accent colour
 * are derived here, inside the component, so callers just say success/error/info.
 */
export type ToastSeverity = 'success' | 'error' | 'info';

export interface ToastProps {
  severity: ToastSeverity;
  /** Short message text, e.g. "Task completed", or JSX with inline emphasis for
   *  the "… was moved to …" confirmation. Wraps freely; never truncated. */
  message: ReactNode;
  /** Called when the toast should disappear (auto-dismiss or the close button). */
  onClose: () => void;
  /** How long (ms) before the toast auto-dismisses. Defaults to 7000 (7s). */
  duration?: number;
}

const TOAST_META: Record<ToastSeverity, { icon: string; label: string }> = {
  success: { icon: 'ri-checkbox-circle-fill', label: 'Success' },
  error: { icon: 'ri-close-circle-fill', label: 'Error' },
  info: { icon: 'ri-information-fill', label: 'Info' },
};

/**
 * Floating bottom-of-viewport notification. It renders as a neutral card (card
 * background + border + radius) with a single row — filled status icon on the
 * left, the (wrapping) message in the middle, and a close button on the right,
 * all vertically aligned. The severity is conveyed only by the coloured status
 * icon; the close button lets the user dismiss it manually any time before the
 * 7s auto-dismiss. The parent owns visibility — it mounts this component (with
 * a changing `key` for a fresh toast each time) and passes only severity +
 * message.
 */
export const Toast = ({ severity, message, onClose, duration = 7000 }: ToastProps) => {
  useEffect(() => {
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onClose]);

  const meta = TOAST_META[severity];

  return (
    <div
      className={`toast toast--${severity}`}
      role={severity === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <Icon name={meta.icon} className={`toast-status-icon toast-status--${severity}`} />
      {/* Names the icon for screen readers; visually hidden via CSS. */}
      <span className="toast-sr-only">{meta.label}: </span>
      <div className="toast-message">{message}</div>
      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Dismiss notification"
        title="Close"
      >
        <Icon name="ri-close-line" />
      </button>
    </div>
  );
};

