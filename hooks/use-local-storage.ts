import { useState, useEffect, useCallback } from "react"

/**
 * Custom hook for localStorage with type safety
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)

  useEffect(() => {
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        setValue(JSON.parse(saved))
      } catch {
        localStorage.removeItem(key)
      }
    }
  }, [key])

  const setStoredValue = useCallback((newValue: T) => {
    setValue(newValue)
    if (newValue === null || newValue === undefined) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(newValue))
    }
  }, [key])

  return [value, setStoredValue] as const
}
