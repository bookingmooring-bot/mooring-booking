import { useState, useEffect } from 'react';

/**
 * Delays updating a value until the user stops typing for `delayMs` milliseconds.
 * Use this to avoid firing API calls on every keystroke.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
