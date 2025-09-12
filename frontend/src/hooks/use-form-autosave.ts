import { useEffect, useCallback, useRef } from 'react'
import { useBeforeUnload } from './use-before-unload'

interface UseFormAutosaveOptions {
  key: string
  data: any
  enabled?: boolean
  debounceMs?: number
}

export function useFormAutosave({ key, data, enabled = true, debounceMs = 2000 }: UseFormAutosaveOptions) {
  const timeoutRef = useRef<number>()
  
  const saveDraft = useCallback(() => {
    if (!enabled) return
    
    try {
      localStorage.setItem(`form_draft_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.warn('Failed to save form draft:', error)
    }
  }, [key, data, enabled])

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(`form_draft_${key}`)
      
      const dashboardKeys = ['dashboard_data', 'cases_cache', 'clients_cache', 'executions_cache', 'compensation_letters_cache']
      dashboardKeys.forEach(cacheKey => {
        try {
          localStorage.removeItem(cacheKey)
        } catch (e) {
          console.warn(`Failed to clear cache ${cacheKey}:`, e)
        }
      })
    } catch (error) {
      console.warn('Failed to clear form draft:', error)
    }
  }, [key])

  const loadDraft = useCallback(() => {
    if (!enabled) return null
    
    try {
      const saved = localStorage.getItem(`form_draft_${key}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        const age = Date.now() - parsed.timestamp
        if (age < 24 * 60 * 60 * 1000) {
          return parsed.data
        } else {
          clearDraft()
        }
      }
    } catch (error) {
      console.warn('Failed to load form draft:', error)
    }
    return null
  }, [key, enabled, clearDraft])

  useEffect(() => {
    if (!enabled) return

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(saveDraft, debounceMs)

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [data, enabled, debounceMs, saveDraft])

  useBeforeUnload(enabled && Object.keys(data).some(key => data[key]))

  return { loadDraft, clearDraft, saveDraft }
}
