import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppDocument } from '../types';
import { searchDocument } from './searchDocument';
import type { SearchResult } from './types';

export interface UseGlobalSearchOptions {
  document: AppDocument | null;
  /** Called once when the user clicks a result; closes the search afterwards. */
  onNavigate: (result: SearchResult) => void;
}

export interface UseGlobalSearchReturn {
  isOpen: boolean;
  query: string;
  results: SearchResult[];
  open: () => void;
  close: () => void;
  handleQueryChange: (value: string) => void;
  handleSelect: (result: SearchResult) => void;
}

/**
 * Owns the search widget's UI state: whether the overlay is open, the current
 * query, and the (memoized) matching results. Closes on Escape.
 */
export const useGlobalSearch = ({ document, onNavigate }: UseGlobalSearchOptions): UseGlobalSearchReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchDocument(document, query), [document, query]);

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery('');
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  const handleQueryChange = useCallback((value: string) => setQuery(value), []);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onNavigate(result);
      setIsOpen(false);
      setQuery('');
    },
    [onNavigate]
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close]);

  return { isOpen, query, results, open, close, handleQueryChange, handleSelect };
};
