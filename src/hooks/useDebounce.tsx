import { useEffect, useState } from "react"

/** String dengan panjang 1..minLength-1 diabaikan (nilai sebelumnya dipertahankan). */
export function useDebounce<T>(value: T, delay = 500, minLength = 3) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    if (typeof value === "string" && value.length < minLength && value.length > 0) {
      return
    }

    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay, minLength])

  return debounced
}
