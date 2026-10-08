import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { MAX_CATEGORY_TITLE_LENGTH } from '../utils';

export interface UseTextPromptOptions {
  isOpen: boolean;
  initialValue?: string;
  maxLength?: number;
  placeholder?: string;
  helperText?: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

export interface UseTextPromptReturn {
  /** Disables the Modal's primary (Save) button while no trimmed text exists. */
  canConfirm: boolean;
  /** Handler for the Modal's primary (Save) button. */
  onPrimary: () => void;
  /** Renders the themed text field + counter + helper hint as the Modal's children. */
  renderField: () => ReactNode;
}

/**
 * Stateful helpers for a text-input prompt hosted inside the existing <Modal>.
 *
 * Each open resets to `initialValue` (so a rename pre-fills its current title
 * and a previously-typed value never leaks into the next invocation), the input
 * receives focus + select-on-open, Enter submits, and every edit is capped by
 * the input's native `maxLength`. The visible counter and "Maximum N
 * characters." helper make the limit obvious up front — something the native
 * prompt() cannot do. Usage: call this hook, then render the returned pieces
 * onto a <Modal> (isOpen/onClose/title stay on the caller).
 */
export function useTextPrompt({
  isOpen,
  initialValue = '',
  maxLength = MAX_CATEGORY_TITLE_LENGTH,
  placeholder,
  helperText,
  onConfirm,
  onClose,
}: UseTextPromptOptions): UseTextPromptReturn {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset to the target value each time the dialog (re)opens so the rename
  // pre-fill and a previously-typed value never leak between invocations.
  // Uses React's render-time adjustment pattern (same as Category's fold state)
  // rather than a setState-in-effect, which React's lint rules discourage.
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (isOpen && !prevOpen) {
    setPrevOpen(true);
    setValue(initialValue);
  } else if (!isOpen && prevOpen) {
    setPrevOpen(false);
  }

  // Focus + select on open so the user can start typing right away (or
  // overwrite the rename pre-fill with a single keystroke).
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isOpen]);

  const trimmed = value.trim();
  const canConfirm = trimmed.length > 0;

  const handlePrimaryAction = () => {
    if (canConfirm) onConfirm(trimmed);
  };

  // Enter on the input is a shortcut for clicking Save. The Modal's own Save
  // button calls onClose, so mirror that here too.
  const handleEnterKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (canConfirm) {
        onConfirm(trimmed);
        onClose();
      }
    }
  };

  const renderField = (): ReactNode => (
    <>
      <div className="modal-text-input-wrap">
        <input
          ref={inputRef}
          className="modal-text-input"
          type="text"
          value={value}
          maxLength={maxLength}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleEnterKey}
          placeholder={placeholder}
        />
        <span className="modal-text-input-counter">
          {value.length}/{maxLength}
        </span>
      </div>
      <p className="modal-text-input-hint">
        {helperText ?? `Maximum ${maxLength} characters.`}
      </p>
    </>
  );

  return {
    canConfirm,
    onPrimary: handlePrimaryAction,
    renderField,
  };
}
