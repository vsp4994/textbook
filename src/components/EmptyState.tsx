import { Icon } from './Icon';

export interface EmptyStateProps {
  /** Remixicon class name for the circular icon (e.g. "ri-book-open-line"). */
  icon: string;
  /** Primary heading shown below the icon. */
  title: string;
  /** One-line supporting copy shown under the heading. */
  subtitle: string;
}

/**
 * Reusable "hero" empty-state block. Was previously inlined directly in App.tsx
 * as `.empty-state.empty-state-hero`; extracted so the home/landing state and
 * the Starred view can share the same markup and styling.
 */
export const EmptyState = ({ icon, title, subtitle }: EmptyStateProps) => (
  <div className="empty-state empty-state-hero">
    <div className="empty-state-icon">
      <Icon name={icon} />
    </div>
    <h2 className="empty-state-title">{title}</h2>
    <p className="empty-state-subtitle">{subtitle}</p>
  </div>
);
