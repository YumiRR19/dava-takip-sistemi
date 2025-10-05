import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Users, Wifi, WifiOff, Database, Server } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api, DashboardData, request } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useRealTimeData } from '@/hooks/use-real-time-data'

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [healthStatus, setHealthStatus] = useState({
    api: true,
    websocket: false,
    database: true
  })
  const { toast } = useToast()
  const { isConnected, hasChangesForEntity, clearDataChanges, isPollingFallback } = useRealTimeData()

  useEffect(() => {
    loadDashboardData()
    checkHealthStatus()
  }, [])

  const checkHealthStatus = async () => {
    try {
      const [wsHealth, dbHealth] = await Promise.all([
        request('/api/health/websocket').catch(() => ({ status: 'error' })),
        request('/api/health/database').catch(() => ({ status: 'error' }))
      ])
      
      setHealthStatus({
        api: true,
        websocket: (wsHealth as any).status === 'ok',
        database: (dbHealth as any).status === 'ok'
      })
    } catch (error) {
      setHealthStatus(prev => ({ ...prev, api: false }))
    }
  }

  useEffect(() => {
    if (hasChangesForEntity('client') || hasChangesForEntity('case') || 
        hasChangesForEntity('compensation_letter') || hasChangesForEntity('execution')) {
      loadDashboardData()
      clearDataChanges()
    }
  }, [hasChangesForEntity, clearDataChanges])

  const loadDashboardData = async () => {
    try {
      const dashboardData = await api.dashboard.getData()
      setData(dashboardData)
      console.log('Dashboard data loaded:', dashboardData)
    } catch (error) {
      console.error('Dashboard loading error:', error)
      toast({
        title: "Hata",
        description: "Dashboard verileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
      setTimeout(() => {
        loadDashboardData()
      }, 2000)
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Veriler yüklenemedi.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-bold text-gray-900">Anasayfa</h1>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Server className="h-4 w-4" />
              <Badge variant={healthStatus.api ? "default" : "destructive"} className="text-xs">
                API {healthStatus.api ? 'Aktif' : 'Hata'}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                WS {isConnected ? 'Bağlı' : (isPollingFallback ? 'Polling' : 'Kapalı')}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <Database className="h-4 w-4" />
              <Badge variant={healthStatus.database ? "default" : "destructive"} className="text-xs">
                DB {healthStatus.database ? 'Aktif' : 'Hata'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link to="/cases/new">Yeni Dava</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/clients/new">Yeni Müvekkil</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Dava</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.total_cases}
              {data.total_cases === 0 && (
                <p className="text-xs text-muted-foreground mt-1">Henüz dava eklenmemiş</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam İcra Takipleri</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.total_executions}
              {data.total_executions === 0 && (
                <p className="text-xs text-muted-foreground mt-1">Henüz icra eklenmemiş</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Teminat Mektupları</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.total_compensation_letters}
              {data.total_compensation_letters === 0 && (
                <p className="text-xs text-muted-foreground mt-1">Henüz teminat mektubu eklenmemiş</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Müvekkil</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.total_clients}
              {data.total_clients === 0 && (
                <p className="text-xs text-muted-foreground mt-1">Henüz müvekkil eklenmemiş</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
