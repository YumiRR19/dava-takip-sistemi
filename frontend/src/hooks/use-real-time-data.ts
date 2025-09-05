import { useEffect, useState, useCallback } from 'react'
import { useWebSocket } from './use-websocket'
import { usePollingFallback } from './use-polling-fallback'
import { useToast } from './use-toast'

interface DataChangeEvent {
  type: 'data_change'
  change_type: 'create' | 'update' | 'delete'
  entity_type: 'client' | 'case' | 'compensation_letter' | 'execution'
  entity_id: string
  data: any
  timestamp: string
}

export function useRealTimeData() {
  const { lastMessage, isConnected } = useWebSocket()
  const { lastPolledData } = usePollingFallback({ enabled: !isConnected })
  const { toast } = useToast()
  const [dataChanges, setDataChanges] = useState<DataChangeEvent[]>([])

  const clearDataChanges = useCallback(() => {
    setDataChanges([])
  }, [])

  useEffect(() => {
    if (lastMessage?.type === 'data_change') {
      const changeEvent = lastMessage as DataChangeEvent
      setDataChanges(prev => [...prev, changeEvent])
      
      const entityNames = {
        client: 'Müvekkil',
        case: 'Dava',
        compensation_letter: 'Teminat Mektubu',
        execution: 'İcra'
      }
      
      const actionNames = {
        create: 'oluşturuldu',
        update: 'güncellendi',
        delete: 'silindi'
      }
      
      const entityName = entityNames[changeEvent.entity_type] || changeEvent.entity_type
      const actionName = actionNames[changeEvent.change_type] || changeEvent.change_type
      
      toast({
        title: "Veri Güncellendi",
        description: `${entityName} ${actionName}. Sayfa otomatik olarak yenileniyor.`,
        duration: 3000,
      })
    }
  }, [lastMessage, toast])

  useEffect(() => {
    if (!isConnected && lastPolledData) {
      setDataChanges(prev => [...prev, {
        type: 'data_change',
        change_type: 'update',
        entity_type: 'client',
        entity_id: 'polling-fallback',
        data: lastPolledData,
        timestamp: new Date().toISOString()
      }])
    }
  }, [lastPolledData, isConnected])

  const getChangesForEntity = useCallback((entityType: string) => {
    return dataChanges.filter(change => change.entity_type === entityType)
  }, [dataChanges])

  const hasChangesForEntity = useCallback((entityType: string) => {
    return dataChanges.some(change => change.entity_type === entityType)
  }, [dataChanges])

  return {
    isConnected,
    dataChanges,
    clearDataChanges,
    getChangesForEntity,
    hasChangesForEntity,
    isPollingFallback: !isConnected
  }
}
