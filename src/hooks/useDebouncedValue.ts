// src/hooks/useDebouncedValue.ts
import { useEffect, useState } from "react";

/**
 * Returns a debounced version of `value` that only updates
 * after `delay` ms have passed with no further changes.
 */
export function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => {
      clearTimeout(handle);
    };
  }, [value, delay]);

  return debounced;
}
