import React, { useState } from 'react';
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
 * buttons — only a subtle close affordance. Each list is rendered as a
 * fold/unfold accordion: the list title is a header that opens/closes that
 * list's destinations, so a document with many categories stays scannable (you
 * just see the list of list titles, then open the one you want). Categories are
 * laid out in their tree order (Main → sub → sub-sub) under their list header;
 * the current list is marked, and invalid destinations (would exceed the
 * 3-level depth cap) are disabled with an explanatory tooltip.
 */
export const MoveModal: React.FC<MoveModalProps> = ({ title, sections, onClose, onMove }) => {
  const hasDestinations = sections.some(
    (section) => section.rootTarget !== null || section.nodes.length > 0
  );

  // Session-only accordion state: every list starts folded so the picker reads
  // as a compact list of list titles. Tapping a title opens (or closes) that
  // list's destinations; the state resets whenever the modal is reopened.
  const [collapsedListIds, setCollapsedListIds] = useState<Set<string>>(
    () => new Set(sections.map((section) => section.listId))
  );

  const toggleList = (listId: string) => {
    setCollapsedListIds((prev) => {
      const next = new Set(prev);
      if (next.has(listId)) {
        next.delete(listId);
      } else {
        next.add(listId);
      }
      return next;
    });
  };

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
          const isCollapsed = collapsedListIds.has(section.listId);
          const destinationCount = (section.rootTarget ? 1 : 0) + section.nodes.length;
          return (
            <div key={section.listId} className="move-section">
              <button
                type="button"
                className="move-section-header"
                aria-expanded={!isCollapsed}
                aria-controls={`move-section-${section.listId}`}
                onClick={() => toggleList(section.listId)}
              >
                <Icon name={isCollapsed ? 'ri-arrow-right-s-line' : 'ri-arrow-down-s-line'} size={18} />
                <span className="move-section-title">{section.listTitle}</span>
                {section.isCurrentList && (
                  <span className="move-section-current">(current)</span>
                )}
                <span className="move-section-count">{destinationCount}</span>
              </button>
              {!isCollapsed && (
                <div id={`move-section-${section.listId}`} className="move-section-body">
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
              )}
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
