import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import type { TodoItemProps } from '../types/todoItem.types';

export const TodoItem: React.FC<TodoItemProps> = ({
  item,
  hideChecked,
  showCheckboxes,
  categoryId,
  focusInputId,
  setFocusInputId,
  onUpdateTodo,
  onDeleteTodo,
  onAddTodoAfter,
  onSetModalConfig,
  setOpenDropdownId,
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (focusInputId === item.id && inputRef.current) {
      inputRef.current.focus();
      setFocusInputId(null);
    }
  }, [focusInputId, item.id, setFocusInputId]);

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

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateTodo(item.id, () => ({ title: e.target.value }));
  };

  const handleNotesBlur = () => {
    if (!item.title.trim()) {
      onDeleteTodo(item.id);
    }
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
    onSetModalConfig({
      isOpen: true,
      type: 'danger',
      title: 'Delete Task',
      message: `Is it okay to delete "${item.title || 'this'}" item?`,
      onConfirm: () => {
        onDeleteTodo(item.id);
      },
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    });
  };

  if (hideChecked && item.completed) {
    return null;
  }

  return (
    <div key={item.id} className="todo-item">
      <div className="todo-row">
        {showCheckboxes && (
          <input
            type="checkbox"
            className="todo-checkbox"
            checked={item.completed}
            onChange={handleCheckboxChange}
          />
        )}

        {showCheckboxes ? (
          <input
            id={`input-${item.id}`}
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            className={`todo-title-input ${item.completed ? 'completed' : ''}`}
            value={item.title}
            placeholder="Task name..."
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            onBlur={handleTitleBlur}
          />
        ) : (
          <textarea
            id={`input-${item.id}`}
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            className="todo-notes"
            value={item.title}
            placeholder="Enter notes..."
            onChange={handleNotesChange}
            onBlur={handleNotesBlur}
          />
        )}

        <button
          className={`icon-btn star-icon-btn ${item.starred && !item.completed ? 'is-starred' : ''}`}
          onClick={handleStarClick}
          title={item.starred ? (item.completed ? 'Unstar (checked)' : 'Unstar') : 'Star'}
        >
          <Icon name={item.starred ? 'ri-star-fill' : 'ri-star-line'} />
        </button>

        <button
          className="icon-btn primary-icon-btn"
          onClick={handleCopyClick}
          disabled={!getCopyText()}
          title={copied ? 'Copied!' : 'Copy'}
        >
          <Icon name={copied ? 'ri-check-line' : 'ri-file-copy-line'} />
        </button>

        <button
          className="icon-btn delete-icon-btn"
          onClick={handleDeleteClick}
          title="Delete"
        >
          <Icon name="ri-delete-bin-line" />
        </button>
      </div>
    </div>
  );
};
