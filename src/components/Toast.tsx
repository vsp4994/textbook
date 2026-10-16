import { useEffect } from 'react';
import { Icon } from './Icon';

/**
 * Supported notification severities. The parent only picks which one to show
 * ("success", "error", or "info"); the matching icon and background colour are
 * derived here, inside the component, so callers just say success/error/info.
 */
export type ToastSeverity = 'success' | 'error' | 'info';

export interface ToastProps {
  severity: ToastSeverity;
  /** Short message text, e.g. "Task completed". */
  message: string;
  /** Called when the toast should disappear (auto-dismiss). */
  onClose: () => void;
  /** How long (ms) before the toast auto-dismisses. Defaults to 3000. */
  duration?: number;
}

const TOAST_META: Record<ToastSeverity, { icon: string; label: string }> = {
  success: { icon: 'ri-check-line', label: 'Success' },
  error: { icon: 'ri-close-circle-line', label: 'Error' },
  info: { icon: 'ri-information-line', label: 'Info' },
};

/**
 * Floating bottom-of-viewport notification. The parent owns visibility — it
 * mounts this component (with a changing `key` for a fresh toast each time) and
 * passes only severity + message. Auto-dismisses after `duration` ms by calling
 * `onClose`.
 */
export const Toast = ({ severity, message, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onClose]);

  const meta = TOAST_META[severity];

  return (
    <div className={`toast toast--${severity}`} role="status" aria-live="polite">
      <Icon name={meta.icon} className="toast-icon" />
      <span className="toast-message">
        {/* Names the icon for screen readers; visually hidden via CSS. */}
        <span className="toast-sr-only">{meta.label}: </span>
        {message}
      </span>
    </div>
  );
};
