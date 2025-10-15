import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Users, Wifi, WifiOff, Database, Server, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  const [reminderFilter, setReminderFilter] = useState<'all' | 'case' | 'execution' | 'compensation_letter'>('all')
  const { toast } = useToast()
  const navigate = useNavigate()
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

  const todayReminders = (data?.upcoming_reminders || []).filter(reminder => {
    const today = new Date()
    const reminderDate = new Date(reminder.reminder_date)
    return today.toDateString() === reminderDate.toDateString()
  })

  const filteredReminders = todayReminders.filter(reminder => {
    if (reminderFilter === 'all') return true
    return reminder.type === reminderFilter
  })


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

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hatırlatmalar</CardTitle>
                <CardDescription>Bugün için hatırlatmalar</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <div className="flex space-x-1">
                  <Button
                    variant={reminderFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReminderFilter('all')}
                  >
                    Tümü
                  </Button>
                  <Button
                    variant={reminderFilter === 'case' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReminderFilter('case')}
                  >
                    Dava Dosyaları
                  </Button>
                  <Button
                    variant={reminderFilter === 'execution' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReminderFilter('execution')}
                  >
                    İcra Takipleri
                  </Button>
                  <Button
                    variant={reminderFilter === 'compensation_letter' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReminderFilter('compensation_letter')}
                  >
                    Teminat Mektupları
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredReminders.slice(0, 500).map((reminder) => (
                <div 
                  key={reminder.type === 'case' ? reminder.case_id : reminder.execution_id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onDoubleClick={() => {
                    if (reminder.type === 'case') {
                      navigate(`/cases/${reminder.case_id}/edit`)
                    } else if (reminder.type === 'execution') {
                      navigate(`/executions/${reminder.execution_id}/edit`)
                    } else if (reminder.type === 'compensation_letter') {
                      navigate(`/compensation-letters/${reminder.compensation_letter_id}/edit`)
                    }
                  }}
                >
                  <div className="flex-1">
                    {reminder.type === 'case' ? (
                      <>
                        <p className="text-sm font-medium text-blue-600">Dosya No: {reminder.case_number}</p>
                        {reminder.case_name && (
                          <p className="text-xs text-gray-700 font-medium">Dava Adı: {reminder.case_name}</p>
                        )}
                        <p className="text-xs text-gray-700 font-medium">Mahkeme: {reminder.court}</p>
                        <p className="text-xs text-gray-600">Müvekkil: {reminder.client_name}</p>
                        <p className="text-xs text-gray-600">Karşı Taraf: {reminder.defendant}</p>
                        {reminder.description && (
                          <p className="text-xs text-gray-500 mt-1">Hatırlatma: {reminder.description}</p>
                        )}
                      </>
                    ) : reminder.type === 'execution' ? (
                      <>
                        <p className="text-sm font-medium text-blue-600">İcra Dosya No: {reminder.execution_number}</p>
                        <p className="text-xs text-gray-700 font-medium">İcra: {reminder.execution_office}</p>
                        <p className="text-xs text-gray-600">Karşı Taraf: {reminder.defendant}</p>
                        {reminder.reminder_text && (
                          <p className="text-xs text-gray-500 mt-1">Hatırlatma Metni: {reminder.reminder_text}</p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-blue-600">Mahkeme: {reminder.court}</p>
                        <p className="text-xs text-gray-700 font-medium">Dosya No: {reminder.case_number}</p>
                        <p className="text-xs text-gray-700 font-medium">Müşteri: {reminder.customer}</p>
                        <p className="text-xs text-gray-700 font-medium">Mektup No: {reminder.letter_number}</p>
                        {reminder.reminder_text && (
                          <p className="text-xs text-gray-500 mt-1">Hatırlatma: {reminder.reminder_text}</p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="text-right">
                    {reminder.görevlendiren && (
                      <p className="text-sm font-medium text-blue-600 mb-1">
                        Görevlendiren: {reminder.görevlendiren}
                      </p>
                    )}
                    {reminder.responsible_person && (
                      <p className="text-sm font-medium text-red-600 mb-1">
                        İlgili/Sorumlu: {reminder.responsible_person}
                      </p>
                    )}
                    <p className="text-sm font-medium text-red-600">
                      {new Date(reminder.reminder_date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              ))}
              {filteredReminders.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {reminderFilter === 'all' 
                      ? 'Bugün için hatırlatma bulunmuyor.' 
                      : `${reminderFilter === 'case' ? 'Dava Dosyaları' : reminderFilter === 'execution' ? 'İcra Takipleri' : 'Teminat Mektupları'} için bugün hatırlatma bulunmuyor.`
                    }
                  </p>
                  {data.total_cases === 0 && data.total_clients === 0 && (
                    <p className="text-xs text-gray-400">Dava ve müvekkil ekleyerek başlayın.</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
