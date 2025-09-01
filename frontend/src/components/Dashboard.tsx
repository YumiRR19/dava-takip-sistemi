import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api, DashboardData } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboardData()
  }, [])

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
        <h1 className="text-3xl font-bold text-gray-900">Anasayfa</h1>
        <div className="flex space-x-3">
          <Button asChild>
            <Link to="/cases/new">Yeni Dava</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/clients/new">Yeni Müvekkil</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Dava</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_cases}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Müvekkil</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_clients}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hatırlatmalar</CardTitle>
            <CardDescription>Önümüzdeki 7 gün içindeki hatırlatmalar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data.upcoming_reminders || []).slice(0, 5).map((reminder) => (
                <div 
                  key={reminder.case_id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onDoubleClick={() => navigate(`/cases/${reminder.case_id}/edit`)}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-600">Dosya No: {reminder.case_number}</p>
                    <p className="text-xs text-gray-700 font-medium">Mahkeme: {reminder.court}</p>
                    <p className="text-xs text-gray-600">Müvekkil: {reminder.client_name}</p>
                    <p className="text-xs text-gray-600">Karşı Taraf: {reminder.defendant}</p>
                    {reminder.description && (
                      <p className="text-xs text-gray-500 mt-1">{reminder.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      {new Date(reminder.reminder_date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              ))}
              {(data.upcoming_reminders?.length || 0) === 0 && (
                <p className="text-sm text-gray-500">Yaklaşan hatırlatma bulunmuyor.</p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
