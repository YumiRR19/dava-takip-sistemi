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
import { useRealTimeData } from '@/hooks/use-real-time-data'
import { useDebouncedSearch } from '@/hooks/use-debounced-search'

export default function Cases() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [responsiblePersonFilter, setResponsiblePersonFilter] = useState<string>('')
  const [görevlendirenFilter, setGörevlendirenFilter] = useState<string>('')
  const { toast } = useToast()
  const { hasChangesForEntity, clearDataChanges } = useRealTimeData()
  const debouncedSearchTerm = useDebouncedSearch(searchTerm, 300)

  useEffect(() => {
    loadCases()
  }, [statusFilter, responsiblePersonFilter, görevlendirenFilter, debouncedSearchTerm])

  useEffect(() => {
    if (hasChangesForEntity('case')) {
      loadCases()
      clearDataChanges()
    }
  }, [hasChangesForEntity, clearDataChanges])

  const loadCases = async () => {
    try {
      const params: any = {}
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter
      }
      if (responsiblePersonFilter && responsiblePersonFilter !== 'all') {
        params.responsible_person = responsiblePersonFilter
      }
      if (görevlendirenFilter && görevlendirenFilter !== 'all') {
        params.görevlendiren = görevlendirenFilter
      }
      if (debouncedSearchTerm) {
        params.query = debouncedSearchTerm
      }
      const casesData = await api.cases.getAll(params)
      setCases(casesData)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Dava Dosyaları yüklenirken bir hata oluştu.",
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
    caseItem.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (caseItem.case_name && caseItem.case_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (caseItem.defendant && caseItem.defendant.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <h1 className="text-3xl font-bold text-gray-900">Dava Dosyaları</h1>
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
            placeholder="Dava başlığı, müvekkil adı, dava numarası, dava adı veya karşı taraf ile ara..."
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
            <SelectItem value="Beraat">Beraat</SelectItem>
            <SelectItem value="Ceza">Ceza</SelectItem>
            <SelectItem value="Kısmen Kabul Kısmen Red">Kısmen Kabul Kısmen Red</SelectItem>
            <SelectItem value="Kabul">Kabul</SelectItem>
            <SelectItem value="Red">Red</SelectItem>
            <SelectItem value="Temyiz">Temyiz</SelectItem>
            <SelectItem value="İstinaf">İstinaf</SelectItem>
            <SelectItem value="Derdest">Derdest</SelectItem>
            <SelectItem value="Kesinleştirme">Kesinleştirme</SelectItem>
            <SelectItem value="Gerekli Karar Bekleniyor">Gerekli Karar Bekleniyor</SelectItem>
            <SelectItem value="Bilirkişi">Bilirkişi</SelectItem>
            <SelectItem value="Konkordato">Konkordato</SelectItem>
          </SelectContent>
        </Select>
        <Select value={responsiblePersonFilter} onValueChange={setResponsiblePersonFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="İlgili/Sorumlu Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Sorumlu Kişiler</SelectItem>
            <SelectItem value="Av.M.Şerif Bey">Av.M.Şerif Bey</SelectItem>
            <SelectItem value="Ömer Bey">Ömer Bey</SelectItem>
            <SelectItem value="Av.İbrahim Bey">Av.İbrahim Bey</SelectItem>
            <SelectItem value="Av.Kenan Bey">Av.Kenan Bey</SelectItem>
            <SelectItem value="İsmail Bey">İsmail Bey</SelectItem>
            <SelectItem value="Ebru Hanım">Ebru Hanım</SelectItem>
            <SelectItem value="Pınar Hanım">Pınar Hanım</SelectItem>
            <SelectItem value="Yaren Hanım">Yaren Hanım</SelectItem>
          </SelectContent>
        </Select>
        <Select value={görevlendirenFilter} onValueChange={setGörevlendirenFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Görevlendiren Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Görevlendirenler</SelectItem>
            <SelectItem value="Av.M.Şerif Bey">Av.M.Şerif Bey</SelectItem>
            <SelectItem value="Ömer Bey">Ömer Bey</SelectItem>
            <SelectItem value="Av.İbrahim Bey">Av.İbrahim Bey</SelectItem>
            <SelectItem value="Av.Kenan Bey">Av.Kenan Bey</SelectItem>
            <SelectItem value="İsmail Bey">İsmail Bey</SelectItem>
            <SelectItem value="Ebru Hanım">Ebru Hanım</SelectItem>
            <SelectItem value="Pınar Hanım">Pınar Hanım</SelectItem>
            <SelectItem value="Yaren Hanım">Yaren Hanım</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredCases.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm || (statusFilter && statusFilter !== 'all') || (responsiblePersonFilter && responsiblePersonFilter !== 'all') || (görevlendirenFilter && görevlendirenFilter !== 'all') ? 'Arama kriterlerinize uygun dava bulunamadı.' : 'Henüz dava bulunmuyor.'}
            </p>
            {!searchTerm && (!statusFilter || statusFilter === 'all') && (!responsiblePersonFilter || responsiblePersonFilter === 'all') && (!görevlendirenFilter || görevlendirenFilter === 'all') && (
              <Button asChild className="mt-4">
                <Link to="/cases/new">İlk Davayı Oluştur</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mahkeme</TableHead>
                    <TableHead>Dosya No</TableHead>
                    <TableHead>Müvekkil</TableHead>
                    <TableHead>Karşı Taraf</TableHead>
                    <TableHead>Dava Adı</TableHead>
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
                      <TableCell>{caseItem.case_name || '-'}</TableCell>
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
