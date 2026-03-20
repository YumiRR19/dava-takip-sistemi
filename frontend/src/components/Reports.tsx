import { useEffect, useState } from 'react'
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { api } from '@/lib/api'

interface ReportsData {
  totals: {
    cases: number
    executions: number
    compensation_letters: number
    clients: number
  }
  case_status_counts: Record<string, number>
  execution_status_counts: Record<string, number>
  letter_status_counts: Record<string, number>
  monthly_trends: Array<{
    month: string
    cases: number
    executions: number
    compensation_letters: number
  }>
  responsible_person_counts: Record<string, number>
  case_type_counts: Record<string, number>
  court_counts: Record<string, number>
}

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
  '#D946EF', '#84CC16'
]

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-')
  const months = ['Oca', 'Sub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Agu', 'Eyl', 'Eki', 'Kas', 'Ara']
  return `${months[parseInt(month) - 1]} ${year}`
}

export default function Reports() {
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadReportsData()
  }, [])

  const loadReportsData = async () => {
    try {
      const reportsData = await api.reports.getData()
      setData(reportsData)
    } catch (error) {
      console.error('Reports loading error:', error)
      toast({
        title: "Hata",
        description: "Rapor verileri yuklenirken bir hata olustu.",
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
        <p className="text-gray-500">Rapor verileri yuklenemedi.</p>
      </div>
    )
  }

  const caseStatusData = Object.entries(data.case_status_counts).map(([name, value]) => ({
    name,
    value,
  }))

  const executionStatusData = Object.entries(data.execution_status_counts).map(([name, value]) => ({
    name,
    value,
  }))

  const responsiblePersonData = Object.entries(data.responsible_person_counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  const caseTypeData = Object.entries(data.case_type_counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  const courtData = Object.entries(data.court_counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Raporlar & Analizler</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Dava</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.totals.cases}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Icra Takipleri</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.totals.executions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Teminat Mektuplari</CardTitle>
            <PieChartIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.totals.compensation_letters}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Muvekkil</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{data.totals.clients}</div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      {data.monthly_trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aylik Trendler</CardTitle>
            <CardDescription>Aylik dava, icra ve teminat mektubu sayilari</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.monthly_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={formatMonth} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  labelFormatter={formatMonth}
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      cases: 'Davalar',
                      executions: 'Icra Takipleri',
                      compensation_letters: 'Teminat Mektuplari'
                    }
                    return [value, labels[name] || name]
                  }}
                />
                <Legend
                  formatter={(value: string) => {
                    const labels: Record<string, string> = {
                      cases: 'Davalar',
                      executions: 'Icra Takipleri',
                      compensation_letters: 'Teminat Mektuplari'
                    }
                    return labels[value] || value
                  }}
                />
                <Bar dataKey="cases" fill="#3B82F6" name="cases" radius={[4, 4, 0, 0]} />
                <Bar dataKey="executions" fill="#EF4444" name="executions" radius={[4, 4, 0, 0]} />
                <Bar dataKey="compensation_letters" fill="#10B981" name="compensation_letters" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Status Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {caseStatusData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Dava Durumlari Dagilimi</CardTitle>
              <CardDescription>Dava dosyalarinin durumlarina gore dagilimi</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={caseStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {caseStatusData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {executionStatusData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Icra Takip Durumlari</CardTitle>
              <CardDescription>Icra takiplerinin durumlarina gore dagilimi</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={executionStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {executionStatusData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Responsible Person Distribution & Case Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {responsiblePersonData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sorumlu Kisi Dagilimi</CardTitle>
              <CardDescription>Dava ve icra dosyalarinin sorumlu kisilere gore dagilimi</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={responsiblePersonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" name="Dosya Sayisi" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {caseTypeData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Dava Turleri</CardTitle>
              <CardDescription>Dava dosyalarinin turlerine gore dagilimi</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={caseTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#F59E0B" name="Dava Sayisi" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Court Distribution */}
      {courtData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mahkeme Dagilimi (Ilk 10)</CardTitle>
            <CardDescription>En cok dava acilan mahkemeler</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={courtData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={80} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#06B6D4" name="Dava Sayisi" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {caseStatusData.length === 0 && executionStatusData.length === 0 && data.monthly_trends.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Henuz rapor verisi bulunmuyor.</p>
            <p className="text-gray-400 text-sm mt-2">Dava, icra ve teminat mektubu ekledikce raporlar burada gorunecektir.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
