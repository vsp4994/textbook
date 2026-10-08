import React from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  type?: 'danger' | 'warning' | 'info';
  /** Optional custom content rendered in place of the default message paragraph. */
  children?: React.ReactNode;
  /** When true, disables the confirm button (e.g. an empty required input). */
  confirmDisabled?: boolean;
}

/**
 * Reusable Modal component for confirmations and alerts
 * 
 * Usage:
 * <Modal
 *   isOpen={true}
 *   onClose={() => setIsOpen(false)}
 *   title="Delete Task"
 *   message="Is it okay to delete this item?"
 *   onConfirm={() => handleDelete()}
 *   type="danger"
 * />
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  type = 'info',
  children,
  confirmDisabled = false,
}) => {
  if (!isOpen) return null;

  const getButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'btn btn-danger';
      case 'warning':
        return 'btn btn-warning';
      default:
        return 'btn btn-primary';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {children ?? <p>{message}</p>}
        <div className="modal-actions">
          <button
            className={getButtonClass()}
            disabled={confirmDisabled}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};