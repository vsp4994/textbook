import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import type { TodoItemProps } from '../types/todoItem.types';

export const TodoItem: React.FC<TodoItemProps> = ({
  item,
  showCheckboxes,
  sortCheckedToBottom,
  categoryId,
  focusInputId,
  setFocusInputId,
  openDropdownId,
  onUpdateTodo,
  onDeleteTodo,
  onAddTodoAfter,
  setOpenDropdownId,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const chipTextRef = useRef<HTMLSpanElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const prevCompletedRef = useRef(item.completed);
  const [copied, setCopied] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [descriptionScrollable, setDescriptionScrollable] = useState(false);
  const [descriptionTruncated, setDescriptionTruncated] = useState(false);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  // When "Show checked at bottom" is enabled and the user ticks a task, the
  // item sinks to the bottom of its category. React reorders keyed DOM nodes,
  // so the same element survives at its new position — after the re-render we
  // smooth-scroll it back into view so the move reads as a glide.
  useLayoutEffect(() => {
    const wasChecked = prevCompletedRef.current;
    prevCompletedRef.current = item.completed;

    // Only the unchecked -> checked transition (with "checked at bottom" on)
    // gets the glide. Already-checked items (initial mount, re-renders) and
    // every uncheck are ignored.
    if (item.completed && !wasChecked && sortCheckedToBottom) {
      if (rootRef.current) {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        rootRef.current.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [item.completed, sortCheckedToBottom]);

  useEffect(() => {
    if (focusInputId === item.id && inputRef.current) {
      inputRef.current.focus();
      setFocusInputId(null);
    }
  }, [focusInputId, item.id, setFocusInputId]);

  // Focus the description editor whenever it opens (via "Add Description" or
  // the description chip) so the user can start typing right away.
  useEffect(() => {
    if (descriptionOpen && descriptionRef.current) {
      descriptionRef.current.focus();
    }
  }, [descriptionOpen]);

  // The expand button is only useful when the textarea has a scrollbar (text to
  // scroll), so only show it then. A ResizeObserver tracks the height change
  // between the collapsed 100px and expanded 400px editor, and the effect also
  // re-runs whenever the description text changes.
  useLayoutEffect(() => {
    const el = descriptionRef.current;
    if (!descriptionOpen || !el) {
      setDescriptionScrollable(false);
      return;
    }

    const update = () => setDescriptionScrollable(el.scrollHeight > el.clientHeight + 1);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [descriptionOpen, descriptionExpanded, item.description]);

  // Whether the single-line description chip truncates its text. The ellipsis
  // and the fade in the chip's right corner are only relevant when the
  // description doesn't fit — a ResizeObserver keeps the fade synced with the
  // available width (and with the text itself), mirroring the expand detection.
  useLayoutEffect(() => {
    const el = chipTextRef.current;
    if (!el) {
      setDescriptionTruncated(false);
      return;
    }
    const update = () => setDescriptionTruncated(el.scrollWidth > el.clientWidth + 1);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [item.description]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateTodo(item.id, () => ({ completed: e.target.checked }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateTodo(item.id, () => ({ title: e.target.value }));
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!item.title.trim()) {
        onDeleteTodo(item.id);
      } else {
        onAddTodoAfter(categoryId || '', item.id);
      }
    }
  };

  const handleTitleBlur = () => {
    if (!item.title.trim()) {
      onDeleteTodo(item.id);
    }
  };

  const hasDescription = Boolean(item.description && item.description.trim());

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateTodo(item.id, () => ({ description: e.target.value }));
  };

  const handleDescriptionToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setDescriptionOpen((open) => !open);
  };

  const handleMoreToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === item.id ? null : item.id);
  };

  const handleAddDescriptionClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    // Always open. The editor hides itself on blur (click-away), matching the
    // way the title/notes input only shows while it's being edited.
    setDescriptionOpen(true);
  };

  const handleDescriptionBlur = () => {
    // Collapse back to 100px so the next open always starts collapsed, and
    // close the editor (click-away) matching the title/notes input behavior.
    setDescriptionExpanded(false);
    setDescriptionOpen(false);
  };

  // Expands/collapses the description textarea between 100px and 400px. The
  // native drag handle is hidden (resize: none), so this floating button is the
  // expand control on all screen sizes, mirroring the notes textarea's button.
  const handleDescriptionExpandClick = () => {
    setDescriptionExpanded((expanded) => {
      // If there's nothing to scroll to and nothing expands, there's no reason
      // to show the expand affordance — dismiss the task menu instead.
      if (!expanded && descriptionRef.current && !descriptionScrollable) {
        setOpenDropdownId(null);
      }
      return !expanded;
    });
  };

  const getCopyText = (): string => item.title || '';

  const handleStarClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onUpdateTodo(item.id, (t) => ({ starred: !t.starred }));
  };

  const handleCopyClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    const text = getCopyText();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for non-secure contexts (e.g. plain http)
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        /* ignore clipboard errors */
      }
    }

    setCopied(true);
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopied(false), 1500);
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    // Delete immediately without a confirmation modal.
    onDeleteTodo(item.id);
  };

  return (
    <div
      key={item.id}
      ref={rootRef}
      className={`todo-item${descriptionOpen ? ' is-description-open' : ''}${hasDescription ? ' has-description' : ''}`}
    >
      <div className="todo-row">
        {showCheckboxes && (
          <input
            type="checkbox"
            className="todo-checkbox"
            checked={item.completed}
            onChange={handleCheckboxChange}
          />
        )}

        <input
          id={`input-${item.id}`}
          ref={inputRef}
          type="text"
          className={`todo-title-input ${item.completed ? 'completed' : ''}`}
          value={item.title}
          placeholder="Task name..."
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          onBlur={handleTitleBlur}
        />

        {hasDescription && (
          <button
            className="icon-btn description-toggle-btn"
            type="button"
            // Keep focus on the textarea while the eye is clicked so the blur
            // handler doesn't close (then reopen) the editor; the toggle below
            // is what decides open vs closed.
            onPointerDown={(e) => e.preventDefault()}
            onClick={handleDescriptionToggle}
            title={descriptionOpen ? 'Hide description' : 'Show description'}
            aria-label={descriptionOpen ? 'Hide description' : 'Show description'}
          >
            <Icon name="ri-quote-text" />
          </button>
        )}

        <div className="todo-row__actions">
          <button
            className={`icon-btn star-icon-btn ${item.starred && !item.completed ? 'is-starred' : ''}`}
            onClick={handleStarClick}
            title={item.starred ? (item.completed ? 'Unstar (checked)' : 'Unstar') : 'Star'}
          >
            <Icon name={item.starred ? 'ri-star-fill' : 'ri-star-line'} />
          </button>

          <div className={`dropdown todo-menu ${openDropdownId === item.id ? 'open' : ''}`}>
            <button
              className="icon-btn todo-menu__toggle"
              type="button"
              onClick={handleMoreToggle}
              title="More actions"
              aria-label="More actions"
            >
              <Icon name="ri-more-2-fill" />
            </button>
            <div className="dropdown-menu todo-menu__dropdown">
              <button type="button" onClick={handleCopyClick} disabled={!getCopyText()}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
              {!hasDescription && (
                <button type="button" onClick={handleAddDescriptionClick}>
                  Add Description
                </button>
              )}
              <button type="button" className="delete-action" onClick={handleDeleteClick}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* The chip is the collapsed state and the editor is the open state, so
          only one is ever visible. Clicking the chip opens the editor. */}
      {hasDescription && !descriptionOpen && (
        <button
          type="button"
          className="todo-description-chip"
          // Keep focus on the textarea while the chip is clicked so the blur
          // handler doesn't close (then reopen) the editor.
          onPointerDown={(e) => e.preventDefault()}
          onClick={handleDescriptionToggle}
          title="Show description"
        >
          <span ref={chipTextRef} className="todo-description-chip__text">
            {item.description}
          </span>
          {descriptionTruncated && <span className="todo-description-chip__fade" aria-hidden="true" />}
        </button>
      )}

      {descriptionOpen && (
        <div className="todo-description-wrap">
          <textarea
            ref={descriptionRef}
            className={`todo-description${descriptionExpanded ? ' is-expanded' : ''}`}
            value={item.description}
            placeholder="Add description..."
            onChange={handleDescriptionChange}
            onBlur={handleDescriptionBlur}
          />
          <button
            className="icon-btn description-expand-btn"
            type="button"
            title={descriptionExpanded ? 'Collapse description' : 'Expand description'}
            aria-label={descriptionExpanded ? 'Collapse description' : 'Expand description'}
            // Keep focus on the textarea while the expand button is clicked so
            // the blur handler doesn't close the editor; the pointerdown
            // preventDefault mirrors the description chip.
            onPointerDown={(e) => e.preventDefault()}
            onClick={handleDescriptionExpandClick}
            style={{ display: descriptionScrollable ? undefined : 'none' }}
          >
            <Icon name={descriptionExpanded ? 'ri-collapse-vertical-line' : 'ri-expand-height-line'} />
          </button>
        </div>
      )}
    </div>
  );
};
