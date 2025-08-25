import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Users, Calendar, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api, DashboardData } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const dashboardData = await api.dashboard.getData()
      setData(dashboardData)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Dashboard verileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
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
        <h1 className="text-3xl font-bold text-gray-900">LexCloud Dashboard</h1>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yaklaşan Duruşma</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.upcoming_hearings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Davalar</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.status_counts['Devam Ediyor'] || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dava Durumları</CardTitle>
            <CardDescription>Mevcut davaların durum dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.status_counts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{status}</span>
                  <span className="text-sm text-gray-500">{count}</span>
                </div>
              ))}
              {Object.keys(data.status_counts).length === 0 && (
                <p className="text-sm text-gray-500">Henüz dava bulunmuyor.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Yaklaşan Duruşmalar</CardTitle>
            <CardDescription>Önümüzdeki 30 gün içindeki duruşmalar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.upcoming_hearings.slice(0, 5).map((hearing) => (
                <div key={hearing.case_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{hearing.case_title}</p>
                    <p className="text-xs text-gray-500">{hearing.client_name}</p>
                    <p className="text-xs text-gray-500">{hearing.court}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(hearing.hearing_date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              ))}
              {data.upcoming_hearings.length === 0 && (
                <p className="text-sm text-gray-500">Yaklaşan duruşma bulunmuyor.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
