import { type ReactNode, useEffect } from 'react';
import { Icon } from './Icon';
import { useI18n, type TranslationKey } from '../i18n';

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

const TOAST_META: Record<ToastSeverity, { icon: string; labelKey: TranslationKey }> = {
  success: { icon: 'ri-checkbox-circle-fill', labelKey: 'toast.success' },
  error: { icon: 'ri-close-circle-fill', labelKey: 'toast.error' },
  info: { icon: 'ri-information-fill', labelKey: 'toast.info' },
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
  const { t } = useI18n();
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
      <span className="toast-sr-only">{t(meta.labelKey)}: </span>
      <div className="toast-message">{message}</div>
      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label={t('toast.dismiss')}
        title={t('common.close')}
      >
        <Icon name="ri-close-line" />
      </button>
    </div>
  );
};

