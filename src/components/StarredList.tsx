import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { EmptyState } from './EmptyState';
import type { StarredItemEntry } from '../utils/categoryUtils';

export interface StarredListProps {
  /** Starred todos across all lists (see collectStarredItems). Always unchecked. */
  entries: StarredItemEntry[];
  /** Called when the user clicks a group header to jump to that source list. */
  onOpenList: (listId: string) => void;
  /**
   * Render prop reused from App so starred todos render exactly like their home
   * category (checkboxes, sorting, focus handling, edit actions, ...).
   */
  renderTodoItem: (
    item: StarredItemEntry['item'],
    showCheckboxes: boolean,
    categoryId?: string,
    sortCheckedToBottom?: boolean
  ) => ReactNode;
}

/** One owning-category "context" inside a list — rendered as a bordered box. */
interface StarredContextBox {
  /** Unique breadcrumb string within the list (e.g. "Topic / Subtopic"). */
  key: string;
  path: string[];
  items: StarredItemEntry[];
}

interface StarredGroup {
  listId: string;
  listTitle: string;
  boxes: StarredContextBox[];
}

/**
 * Always-visible "Starred" view: every logged-in starred todo across all lists,
 * grouped first by its source list and then by the owning category's context.
 * Each category context becomes a bordered box whose top-left heading is the
 * category breadcrumb (.starred-item-context), with that category's tasks laid
 * out inside. Unstarring or checking a task removes it immediately because
 * collectStarredItems only keeps currently-starred, unchecked todos.
 */
export const StarredList = ({ entries, onOpenList, renderTodoItem }: StarredListProps) => {
  // Group by source list (document order), then by category context within it.
  const groups: StarredGroup[] = [];
  const groupIndex = new Map<string, number>();
  for (const entry of entries) {
    let group = groups[groupIndex.get(entry.listId) ?? -1];
    if (!group) {
      group = { listId: entry.listId, listTitle: entry.listTitle, boxes: [] };
      groupIndex.set(entry.listId, groups.length);
      groups.push(group);
    }

    const contextKey = entry.categoryPath.join(' / ');
    let box = group.boxes.find((b) => b.key === contextKey);
    if (!box) {
      box = { key: contextKey, path: entry.categoryPath, items: [] };
      group.boxes.push(box);
    }
    box.items.push(entry);
  }

  return (
    <div className="starred-list">
      {groups.length === 0 ? (
        <EmptyState
          icon="ri-star-line"
          title="Nothing starred yet"
          subtitle="Tap the star on any task to keep it here for quick access."
        />
      ) : (
        <div className="starred-groups">
          {groups.map((group) => (
            <section key={group.listId} className="starred-group">
              <button
                className="starred-group-header"
                onClick={() => onOpenList(group.listId)}
                type="button"
                title={`Open "${group.listTitle}"`}
              >
                <Icon name="ri-arrow-right-up-line" className="starred-group-icon" />
                <span className="starred-group-title">{group.listTitle}</span>
                <span className="starred-group-count">
                  {group.boxes.reduce((n, box) => n + box.items.length, 0)}
                </span>
              </button>

              <div className="starred-group-boxes">
                {group.boxes.map((box) => (
                  <div key={box.key} className="starred-context-box">
                    <div className="starred-item-context" title={box.key}>
                      <Icon name="ri-folder-line" />
                      {box.key}
                    </div>
                    <div className="starred-context-items">
                      {box.items.map((entry) => (
                        <div key={entry.item.id} className="starred-item">
                          {/* sortCheckedToBottom is always off here: only unchecked
                              todos are shown, and checking one removes it instantly. */}
                          {renderTodoItem(entry.item, entry.showCheckboxes, entry.categoryId, false)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

