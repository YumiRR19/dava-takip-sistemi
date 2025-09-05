import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'

interface PollingFallbackOptions {
  enabled: boolean
  interval?: number
}

export function usePollingFallback({ enabled, interval = 10000 }: PollingFallbackOptions) {
  const [lastPolledData, setLastPolledData] = useState<any>(null)
  const intervalRef = useRef<number>()

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
      }
      return
    }

    const pollData = async () => {
      try {
        const [clients, cases, executions, compensationLetters] = await Promise.all([
          api.clients.getAll(),
          api.cases.getAll(),
          api.executions.getAll(),
          api.compensationLetters.getAll()
        ])
        
        const newData = {
          clients,
          cases,
          executions,
          compensationLetters,
          timestamp: Date.now()
        }
        
        setLastPolledData(newData)
      } catch (error) {
        console.error('Polling fallback error:', error)
      }
    }

    pollData()
    
    intervalRef.current = window.setInterval(pollData, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, interval])

  return { lastPolledData }
}
