import type { TodoItemType } from "../../types";

export interface ModalConfig {
  isOpen: boolean;
  type: 'danger' | 'warning' | 'info';
  title: string;
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface TodoItemProps {
  item: TodoItemType;
  hideChecked: boolean;
  showCheckboxes: boolean;
  categoryId?: string;
  focusInputId: string | null;
  setFocusInputId: (id: string | null) => void;
  onUpdateTodo: (todoId: string, mutation: (item: TodoItemType) => Partial<TodoItemType>) => void;
  onDeleteTodo: (todoId: string) => void;
  onAddTodoAfter: (categoryId: string, todoId: string) => void;
  onSetModalConfig: (config: ModalConfig) => void;
  setOpenDropdownId: (id: string | null) => void;
}