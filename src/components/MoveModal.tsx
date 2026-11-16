import React from 'react';
import { Icon } from './Icon';
import { Modal } from './Modal';
import type { MoveSection, MoveTarget } from '../utils/moveUtils';

export interface MoveModalProps {
  title: string;
  sections: MoveSection[];
  onClose: () => void;
  onMove: (target: MoveTarget) => void;
}

/**
 * Destination-picker modal for the "Move to ..." feature.
 *
 * The modal is intentionally full of destination buttons: clicking one performs
 * the move immediately, so there are no separate action (confirm/cancel)
 * buttons — only a subtle close affordance. Categories are laid out in their
 * tree order (Main → sub → sub-sub) under a per-list header; the current list
 * is marked, and invalid destinations (would exceed the 3-level depth cap) are
 * disabled with an explanatory tooltip.
 */
export const MoveModal: React.FC<MoveModalProps> = ({ title, sections, onClose, onMove }) => {
  const hasDestinations = sections.some(
    (section) => section.rootTarget !== null || section.nodes.length > 0
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={title}
      message=""
      type="info"
      onConfirm={() => undefined}
      confirmLabel=""
      cancelLabel=""
      actions={<></>}
    >
      <div className="move-destination-list" onClick={(e) => e.stopPropagation()}>
        {!hasDestinations && (
          <p className="move-empty-note">No other destinations available in this document.</p>
        )}
        {sections.map((section) => {
          if (section.rootTarget === null && section.nodes.length === 0) return null;
          return (
            <div key={section.listId} className="move-section">
              <div className="move-section-header">
                <Icon name="ri-arrow-right-up-line" size={14} />
                <span>{section.listTitle}</span>
                {section.isCurrentList && <span className="move-section-current">(current)</span>}
              </div>
              {section.rootTarget && (
                <button
                  type="button"
                  className="move-destination move-destination--root"
                  disabled={section.rootTarget.disabled}
                  title={section.rootTarget.disabledReason}
                  onClick={() => onMove(section.rootTarget!.target)}
                >
                  <Icon name="ri-add-box-line" size={16} />
                  <span>{section.rootTarget.title}</span>
                </button>
              )}
              {section.nodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  className={`move-destination${node.disabled ? ' is-disabled' : ''}`}
                  style={{ paddingLeft: `${12 + (node.depth - 1) * 18}px` }}
                  disabled={node.disabled}
                  title={node.disabledReason}
                  onClick={() => onMove(node.target)}
                >
                  <Icon name={node.disabled ? 'ri-lock-line' : 'ri-corner-down-right-line'} size={16} />
                  <span>{node.title}</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
      <button type="button" className="move-modal-close" onClick={onClose}>
        Close
      </button>
    </Modal>
  );
};
