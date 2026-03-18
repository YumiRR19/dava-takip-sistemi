import { useEffect, useState, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Users, Wifi, WifiOff, Database, Server, Filter, Star, CalendarIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { api, DashboardData, request } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useRealTimeData } from '@/hooks/use-real-time-data'

const RESPONSIBLE_PERSONS_ORDER = [
  'Av.M.Şerif Bey',
  'Ömer Bey',
  'Av.İbrahim Bey',
  'Av.Kenan Bey',
  'İsmail Bey',
  'Ebru Hanım',
  'Pınar Hanım',
  'Yaren Hanım',
]

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [healthStatus, setHealthStatus] = useState({
    api: true,
    websocket: false,
    database: true
  })
  const [reminderFilter, setReminderFilter] = useState<'all' | 'case' | 'execution' | 'compensation_letter' | 'haciz_reminder'>('all')
  const [responsibleFilter, setResponsibleFilter] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const { toast } = useToast()
  const navigate = useNavigate()
  const { isConnected, hasChangesForEntity, clearDataChanges, isPollingFallback } = useRealTimeData()

  const loadDashboardData = useCallback(async () => {
    try {
      const params = selectedDate ? { reminder_date: selectedDate } : undefined
      const dashboardData = await api.dashboard.getData(params)
      setData(dashboardData)
      console.log('Dashboard data loaded:', dashboardData)
    } catch (error) {
      console.error('Dashboard loading error:', error)
      toast({
        title: "Hata",
        description: "Dashboard verileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [selectedDate, toast])

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
    loadDashboardData()
    checkHealthStatus()
  }, [loadDashboardData])

  useEffect(() => {
    if (hasChangesForEntity('client') || hasChangesForEntity('case') || 
        hasChangesForEntity('compensation_letter') || hasChangesForEntity('execution')) {
      loadDashboardData()
      clearDataChanges()
    }
  }, [hasChangesForEntity, clearDataChanges, loadDashboardData])

  // When a date is selected, the backend already filters by that date.
  // When no date is selected, the backend returns reminders for today+7 days,
  // and we further filter to show only today's reminders by default.
  const displayReminders = useMemo(() => {
    const reminders = data?.upcoming_reminders || []
    if (selectedDate) {
      // Backend already filtered by the selected date
      return reminders
    }
    // Default: show only today's reminders
    const today = new Date()
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.reminder_date)
      return today.toDateString() === reminderDate.toDateString()
    })
  }, [data?.upcoming_reminders, selectedDate])

  const getReminderKey = useCallback((reminder: DashboardData['upcoming_reminders'][number]): string => {
    if (reminder.type === 'case') return `case-${reminder.case_id}`
    if (reminder.type === 'execution') return `execution-${reminder.execution_id}`
    if (reminder.type === 'haciz_reminder') return `haciz_reminder-${reminder.execution_id}`
    return `compensation_letter-${reminder.compensation_letter_id}`
  }, [])

  const getEntityInfo = useCallback((reminderKey: string): { entityType: string; entityId: string } => {
    const parts = reminderKey.split('-')
    if (reminderKey.startsWith('compensation_letter-')) {
      return { entityType: 'compensation_letter', entityId: parts.slice(1).join('-') }
    }
    if (reminderKey.startsWith('haciz_reminder-')) {
      return { entityType: 'execution', entityId: parts.slice(1).join('-') }
    }
    return { entityType: parts[0], entityId: parts.slice(1).join('-') }
  }, [])

  const toggleStar = useCallback(async (reminderKey: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const { entityType, entityId } = getEntityInfo(reminderKey)
    try {
      await api.reminders.toggleStar(entityType, entityId)
      loadDashboardData()
    } catch (error) {
      console.error('Error toggling star:', error)
      toast({
        title: "Hata",
        description: "Yıldız durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }, [getEntityInfo, toast, loadDashboardData])

  // Fixed ordered list of responsible persons
  const responsiblePersons = RESPONSIBLE_PERSONS_ORDER

  const filteredReminders = displayReminders
    .filter(reminder => {
      if (reminderFilter !== 'all') {
        if (reminderFilter === 'haciz_reminder') {
          if (reminder.type !== 'haciz_reminder') return false
        } else if (reminder.type !== reminderFilter) return false
      }
      if (responsibleFilter !== 'all' && reminder.responsible_person !== responsibleFilter) return false
      return true
    })
    .sort((a, b) => {
      const aStarred = a.is_starred === true
      const bStarred = b.is_starred === true
      if (aStarred && !bStarred) return -1
      if (!aStarred && bStarred) return 1
      return 0
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
          <Button asChild variant="secondary">
            <Link to="/executions/new">Yeni İcra</Link>
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
                <CardDescription>
                  {selectedDate
                    ? `${new Date(selectedDate + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} için hatırlatmalar`
                    : 'Bugün için hatırlatmalar'}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-[160px] h-9 text-sm"
                    placeholder="Tarih Seç"
                  />
                  {selectedDate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDate('')}
                      className="h-9 px-2 text-xs"
                    >
                      Bugün
                    </Button>
                  )}
                </div>
                <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="İlgili / Sorumlu Seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Sorumlular</SelectItem>
                    {responsiblePersons.map((person) => (
                      <SelectItem key={person} value={person}>
                        {person}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={reminderFilter} onValueChange={(value: 'all' | 'case' | 'execution' | 'compensation_letter' | 'haciz_reminder') => setReminderFilter(value)}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="h-4 w-4 text-gray-500 mr-1" />
                    <SelectValue placeholder="Filtre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="case">Dava Dosyaları</SelectItem>
                    <SelectItem value="execution">İcra Takipleri</SelectItem>
                    <SelectItem value="haciz_reminder">Haciz Hatırlatma</SelectItem>
                    <SelectItem value="compensation_letter">Teminat Mektupları</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredReminders.slice(0, 500).map((reminder) => {
                const reminderKey = getReminderKey(reminder)
                const isStarred = reminder.is_starred === true
                return (
                <div 
                  key={reminderKey} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onDoubleClick={() => {
                    if (reminder.type === 'case') {
                      navigate(`/cases/${reminder.case_id}/edit`)
                    } else if (reminder.type === 'execution' || reminder.type === 'haciz_reminder') {
                      navigate(`/executions/${reminder.execution_id}/edit`)
                    } else if (reminder.type === 'compensation_letter') {
                      navigate(`/compensation-letters/${reminder.compensation_letter_id}/edit`)
                    }
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => toggleStar(reminderKey, e)}
                    className="flex-shrink-0 mr-3 focus:outline-none"
                    title={isStarred ? 'Yıldızı kaldır' : 'Yıldızla'}
                  >
                    <Star
                      className={`h-5 w-5 transition-colors ${
                        isStarred
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    />
                  </button>
                  <div className="flex-1">
                    {reminder.type === 'case' ? (
                      <>
                        <p className="text-sm font-medium text-blue-600">Dosya No: {reminder.case_number}</p>
                        {reminder.case_name && (
                          <p className="text-xs text-gray-700 font-medium">Dava Adı: {reminder.case_name}</p>
                        )}
                        <p className="text-xs text-gray-700 font-medium">Mahkeme: {reminder.court}</p>
                        <p className="text-xs text-gray-600">Davacı: {reminder.client_name}</p>
                        <p className="text-xs text-gray-600">Davalı: {reminder.defendant}</p>
                        {reminder.description && (
                          <p className="text-xs text-gray-500 mt-1">Hatırlatma: {reminder.description}</p>
                        )}
                      </>
                    ) : reminder.type === 'execution' ? (
                      <>
                        <p className="text-sm font-medium text-blue-600">İcra Dosya No: {reminder.execution_number}</p>
                        <p className="text-xs text-gray-700 font-medium">İcra: {reminder.execution_office}</p>
                        <p className="text-xs text-gray-600">Borçlu: {reminder.defendant}</p>
                        {reminder.reminder_text && (
                          <p className="text-xs text-gray-500 mt-1">İşlem Hatırlatma: {reminder.reminder_text}</p>
                        )}
                      </>
                    ) : reminder.type === 'haciz_reminder' ? (
                      <>
                        <p className="text-sm font-medium text-orange-600">HACİZ HATIRLATMA - İCRA NO: {reminder.execution_number}</p>
                        <p className="text-xs text-gray-700 font-medium">İcra: {reminder.execution_office}</p>
                        <p className="text-xs text-gray-600">Borçlu: {reminder.defendant}</p>
                        {reminder.haciz_durumu && (
                          <p className="text-xs text-gray-600">Haciz Durumu: {reminder.haciz_durumu}</p>
                        )}
                        {reminder.reminder_text && (
                          <p className="text-xs text-gray-500 mt-1">Haciz Hatırlatma: {reminder.reminder_text}</p>
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
              )})
              }
              {filteredReminders.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {selectedDate
                      ? (reminderFilter === 'all'
                          ? `${new Date(selectedDate + 'T00:00:00').toLocaleDateString('tr-TR')} için hatırlatma bulunmuyor.`
                          : `${reminderFilter === 'case' ? 'Dava Dosyaları' : reminderFilter === 'execution' ? 'İcra Takipleri' : reminderFilter === 'haciz_reminder' ? 'Haciz Hatırlatma' : 'Teminat Mektupları'} için ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('tr-TR')} tarihinde hatırlatma bulunmuyor.`)
                      : (reminderFilter === 'all' 
                          ? 'Bugün için hatırlatma bulunmuyor.' 
                          : `${reminderFilter === 'case' ? 'Dava Dosyaları' : reminderFilter === 'execution' ? 'İcra Takipleri' : reminderFilter === 'haciz_reminder' ? 'Haciz Hatırlatma' : 'Teminat Mektupları'} için bugün hatırlatma bulunmuyor.`)
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
