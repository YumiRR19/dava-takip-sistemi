import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { api, Case } from '@/lib/api'

export default function Cases() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
    loadCases()
  }, [statusFilter])

  const loadCases = async () => {
    try {
      const params = statusFilter && statusFilter !== 'all' ? { status: statusFilter } : undefined
      const casesData = await api.cases.getAll(params)
      setCases(casesData)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Davalar yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (caseId: string) => {
    if (!confirm('Bu davayı silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await api.cases.delete(caseId)
      setCases(cases.filter(c => c.id !== caseId))
      toast({
        title: "Başarılı",
        description: "Dava başarıyla silindi.",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Dava silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const filteredCases = cases.filter(caseItem =>
    caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.case_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Davalar</h1>
        <Button asChild>
          <Link to="/cases/new">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Dava
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Dava başlığı, müvekkil adı veya dava numarası ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Durum filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
            <SelectItem value="Kazanıldı">Kazanıldı</SelectItem>
            <SelectItem value="Kaybedildi">Kaybedildi</SelectItem>
            <SelectItem value="Beklemede">Beklemede</SelectItem>
            <SelectItem value="İptal Edildi">İptal Edildi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredCases.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm || (statusFilter && statusFilter !== 'all') ? 'Arama kriterlerinize uygun dava bulunamadı.' : 'Henüz dava bulunmuyor.'}
            </p>
            {!searchTerm && (!statusFilter || statusFilter === 'all') && (
              <Button asChild className="mt-4">
                <Link to="/cases/new">İlk Davayı Oluştur</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mahkeme/İcra</TableHead>
                  <TableHead>Dosya No</TableHead>
                  <TableHead>Müvekkil</TableHead>
                  <TableHead>Karşı Taraf</TableHead>
                  <TableHead>Hatırlatma Tarihi</TableHead>
                  <TableHead>Hatırlatma Metni</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell className="font-medium">{caseItem.court}</TableCell>
                    <TableCell>{caseItem.case_number}</TableCell>
                    <TableCell>{caseItem.client_name}</TableCell>
                    <TableCell>{caseItem.defendant}</TableCell>
                    <TableCell>
                      {caseItem.reminder_date 
                        ? new Date(caseItem.reminder_date).toLocaleDateString('tr-TR')
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{caseItem.description || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/cases/${caseItem.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(caseItem.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
