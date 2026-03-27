import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Users, Wifi, WifiOff, Database, Server, Filter, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api, DashboardData, request } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useRealTimeData } from '@/hooks/use-real-time-data'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [healthStatus, setHealthStatus] = useState({
    api: true,
    websocket: false,
    database: true
  })
  const [reminderFilter, setReminderFilter] = useState<'all' | 'case' | 'execution' | 'compensation_letter'>('all')
  const [starredReminders, setStarredReminders] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('starred_reminders')
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  })
  const { toast } = useToast()
  const navigate = useNavigate()
  const { isConnected, hasChangesForEntity, clearDataChanges, isPollingFallback } = useRealTimeData()
  const { t, language } = useLanguage()

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
        title: t.common.error,
        description: t.common.error,
        variant: "destructive",
      })
      setTimeout(() => {
        loadDashboardData()
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  const getDateLocale = () => {
    if (language === 'tr') return 'tr-TR'
    if (language === 'de') return 'de-DE'
    return 'en-US'
  }

  const todayReminders = (data?.upcoming_reminders || []).filter(reminder => {
    const today = new Date()
    const reminderDate = new Date(reminder.reminder_date)
    return today.toDateString() === reminderDate.toDateString()
  })

  const getReminderKey = useCallback((reminder: DashboardData['upcoming_reminders'][number]): string => {
    if (reminder.type === 'case') return `case-${reminder.case_id}`
    if (reminder.type === 'execution') return `execution-${reminder.execution_id}`
    return `compensation_letter-${reminder.compensation_letter_id}`
  }, [])

  const toggleStar = useCallback((reminderKey: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setStarredReminders(prev => {
      const next = new Set(prev)
      if (next.has(reminderKey)) {
        next.delete(reminderKey)
      } else {
        next.add(reminderKey)
      }
      localStorage.setItem('starred_reminders', JSON.stringify([...next]))
      return next
    })
  }, [])

  const filteredReminders = todayReminders
    .filter(reminder => {
      if (reminderFilter === 'all') return true
      return reminder.type === reminderFilter
    })
    .sort((a, b) => {
      const aStarred = starredReminders.has(getReminderKey(a))
      const bStarred = starredReminders.has(getReminderKey(b))
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
        <p className="text-gray-500">{t.common.error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-bold text-gray-900">{t.dashboard.title}</h1>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Server className="h-4 w-4" />
              <Badge variant={healthStatus.api ? "default" : "destructive"} className="text-xs">
                API {healthStatus.api ? t.dashboard.apiActive : t.dashboard.apiError}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                WS {isConnected ? t.dashboard.wsConnected : (isPollingFallback ? t.dashboard.wsPolling : t.dashboard.wsClosed)}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <Database className="h-4 w-4" />
              <Badge variant={healthStatus.database ? "default" : "destructive"} className="text-xs">
                DB {healthStatus.database ? t.dashboard.dbActive : t.dashboard.dbError}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link to="/cases/new">{t.dashboard.newCase}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/clients/new">{t.dashboard.newClient}</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.totalCases}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.total_cases}
              {data.total_cases === 0 && (
                <p className="text-xs text-muted-foreground mt-1">{t.dashboard.noCasesYet}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.totalExecutions}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.total_executions}
              {data.total_executions === 0 && (
                <p className="text-xs text-muted-foreground mt-1">{t.dashboard.noExecutionsYet}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.totalCompensationLetters}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.total_compensation_letters}
              {data.total_compensation_letters === 0 && (
                <p className="text-xs text-muted-foreground mt-1">{t.dashboard.noCompensationLettersYet}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.totalClients}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.total_clients}
              {data.total_clients === 0 && (
                <p className="text-xs text-muted-foreground mt-1">{t.dashboard.noClientsYet}</p>
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
                <CardTitle>{t.dashboard.reminders}</CardTitle>
                <CardDescription>{t.dashboard.todayReminders}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <div className="flex space-x-1">
                  <Button
                    variant={reminderFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReminderFilter('all')}
                  >
                    {t.common.all}
                  </Button>
                  <Button
                    variant={reminderFilter === 'case' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReminderFilter('case')}
                  >
                    {t.dashboard.caseFiles}
                  </Button>
                  <Button
                    variant={reminderFilter === 'execution' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReminderFilter('execution')}
                  >
                    {t.dashboard.executionFiles}
                  </Button>
                  <Button
                    variant={reminderFilter === 'compensation_letter' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReminderFilter('compensation_letter')}
                  >
                    {t.dashboard.compensationLettersFilter}
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredReminders.slice(0, 500).map((reminder) => {
                const reminderKey = getReminderKey(reminder)
                const isStarred = starredReminders.has(reminderKey)
                return (
                <div 
                  key={reminderKey} 
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
                        <p className="text-sm font-medium text-blue-600">{t.dashboard.fileNo}: {reminder.case_number}</p>
                        {reminder.case_name && (
                          <p className="text-xs text-gray-700 font-medium">{t.dashboard.caseName}: {reminder.case_name}</p>
                        )}
                        <p className="text-xs text-gray-700 font-medium">{t.dashboard.court}: {reminder.court}</p>
                        <p className="text-xs text-gray-600">{t.dashboard.client}: {reminder.client_name}</p>
                        <p className="text-xs text-gray-600">{t.dashboard.defendant}: {reminder.defendant}</p>
                        {reminder.description && (
                          <p className="text-xs text-gray-500 mt-1">{t.dashboard.reminder}: {reminder.description}</p>
                        )}
                      </>
                    ) : reminder.type === 'execution' ? (
                      <>
                        <p className="text-sm font-medium text-blue-600">{t.dashboard.executionFileNo}: {reminder.execution_number}</p>
                        <p className="text-xs text-gray-700 font-medium">{t.dashboard.execution}: {reminder.execution_office}</p>
                        <p className="text-xs text-gray-600">{t.dashboard.defendant}: {reminder.defendant}</p>
                        {reminder.reminder_text && (
                          <p className="text-xs text-gray-500 mt-1">{t.dashboard.reminderText}: {reminder.reminder_text}</p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-blue-600">{t.dashboard.court}: {reminder.court}</p>
                        <p className="text-xs text-gray-700 font-medium">{t.dashboard.fileNo}: {reminder.case_number}</p>
                        <p className="text-xs text-gray-700 font-medium">{t.dashboard.customer}: {reminder.customer}</p>
                        <p className="text-xs text-gray-700 font-medium">{t.dashboard.letterNo}: {reminder.letter_number}</p>
                        {reminder.reminder_text && (
                          <p className="text-xs text-gray-500 mt-1">{t.dashboard.reminder}: {reminder.reminder_text}</p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="text-right">
                    {reminder.görevlendiren && (
                      <p className="text-sm font-medium text-blue-600 mb-1">
                        {t.dashboard.assignedBy}: {reminder.görevlendiren}
                      </p>
                    )}
                    {reminder.responsible_person && (
                      <p className="text-sm font-medium text-red-600 mb-1">
                        {t.dashboard.responsiblePerson}: {reminder.responsible_person}
                      </p>
                    )}
                    <p className="text-sm font-medium text-red-600">
                      {new Date(reminder.reminder_date).toLocaleDateString(getDateLocale())}
                    </p>
                  </div>
                </div>
              )})
              }
              {filteredReminders.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {reminderFilter === 'all' 
                      ? t.dashboard.noRemindersToday
                      : t.dashboard.noRemindersForFilter
                    }
                  </p>
                  {data.total_cases === 0 && data.total_clients === 0 && (
                    <p className="text-xs text-gray-400">{t.dashboard.startByAddingCasesAndClients}</p>
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
