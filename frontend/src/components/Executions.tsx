import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api, Execution } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

export default function Executions() {
  const [executions, setExecutions] = useState<Execution[]>([])
  const [filteredExecutions, setFilteredExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [hacizFilter, setHacizFilter] = useState<string>('all')
  const [responsiblePersonFilter, setResponsiblePersonFilter] = useState<string>('all')
  const [görevlendirenFilter, setGörevlendirenFilter] = useState<string>('all')
  const [executionTypeFilter, setExecutionTypeFilter] = useState<string>('all')
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    loadExecutions()
  }, [])

  useEffect(() => {
    filterExecutions()
  }, [executions, searchTerm, statusFilter, hacizFilter, responsiblePersonFilter, görevlendirenFilter, executionTypeFilter])

  const loadExecutions = async () => {
    try {
      const executionsData = await api.executions.getAll()
      setExecutions(executionsData)
    } catch (error) {
      toast({
        title: "Hata",
        description: "İcra Takipleri yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterExecutions = () => {
    let filtered = executions

    if (searchTerm) {
      filtered = filtered.filter(execution => 
        execution.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        execution.defendant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        execution.execution_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(execution => execution.status === statusFilter)
    }

    if (hacizFilter !== 'all') {
      filtered = filtered.filter(execution => execution.haciz_durumu === hacizFilter)
    }

    if (responsiblePersonFilter !== 'all') {
      filtered = filtered.filter(execution => execution.responsible_person === responsiblePersonFilter)
    }

    if (görevlendirenFilter !== 'all') {
      filtered = filtered.filter(execution => (execution as any).görevlendiren === görevlendirenFilter)
    }

    if (executionTypeFilter !== 'all') {
      filtered = filtered.filter(execution => execution.execution_type === executionTypeFilter)
    }

    setFilteredExecutions(filtered)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu icrayı silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await api.executions.delete(id)
      toast({
        title: "Başarılı",
        description: "İcra başarıyla silindi.",
      })
      loadExecutions()
    } catch (error) {
      toast({
        title: "Hata",
        description: "İcra silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Derdest':
        return 'default'
      case 'İnfaz':
        return 'destructive'
      case 'Haricen Tahsil':
        return 'destructive'
      case 'İtirazlı':
        return 'outline'
      case 'İcranın Geri Bırakılması':
        return 'secondary'
      case 'Davalı':
        return 'default'
      case 'Ödeme Sözü':
        return 'secondary'
      case 'Bilirkişi':
        return 'outline'
      default:
        return 'default'
    }
  }

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
        <h1 className="text-3xl font-bold text-gray-900">İcra Takipleri</h1>
        <Button asChild>
          <Link to="/executions/new">
            <Plus className="h-4 w-4 mr-2" />
            Yeni İcra
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>İcra Listesi</CardTitle>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Müvekkil, karşı taraf veya icra dosya no ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <CardDescription>
            Tüm icra kayıtlarınızı görüntüleyin ve yönetin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Durum filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="Derdest">Derdest</SelectItem>
                <SelectItem value="İnfaz">İnfaz</SelectItem>
                <SelectItem value="Haricen Tahsil">Haricen Tahsil</SelectItem>
                <SelectItem value="İtirazlı">İtirazlı</SelectItem>
                <SelectItem value="İcranın Geri Bırakılması">İcranın Geri Bırakılması</SelectItem>
                <SelectItem value="Davalı">Davalı</SelectItem>
                <SelectItem value="Ödeme Sözü">Ödeme Sözü</SelectItem>
                <SelectItem value="Bilirkişi">Bilirkişi</SelectItem>
              </SelectContent>
            </Select>

            <Select value={executionTypeFilter} onValueChange={setExecutionTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="İcra türü filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm İcra Türleri</SelectItem>
                <SelectItem value="İlamsız Kredi Kartı">İlamsız Kredi Kartı</SelectItem>
                <SelectItem value="İlamsız İhtiyaç Kartı">İlamsız İhtiyaç Kartı</SelectItem>
                <SelectItem value="İlamsız GKS">İlamsız GKS</SelectItem>
                <SelectItem value="Kambiyo / Bono">Kambiyo / Bono</SelectItem>
                <SelectItem value="Kambiyo / Çek">Kambiyo / Çek</SelectItem>
                <SelectItem value="İlamsız / Çek">İlamsız / Çek</SelectItem>
                <SelectItem value="Rehin – Örnek 8">Rehin – Örnek 8</SelectItem>
                <SelectItem value="İpotek – Örnek 6">İpotek – Örnek 6</SelectItem>
                <SelectItem value="İpotek – Örnek 9">İpotek – Örnek 9</SelectItem>
                <SelectItem value="Örnek 4-5">Örnek 4-5</SelectItem>
                <SelectItem value="İlamsız Fatura">İlamsız Fatura</SelectItem>
                <SelectItem value="Nafaka – Örnek 49">Nafaka – Örnek 49</SelectItem>
                <SelectItem value="İhtiyat-İ Tedbir">İhtiyat-İ Tedbir</SelectItem>
                <SelectItem value="Adi Kira ve Hasılat Kirası – Örnek 13">Adi Kira ve Hasılat Kirası – Örnek 13</SelectItem>
                <SelectItem value="Tahliye – Örnek 14">Tahliye – Örnek 14</SelectItem>
              </SelectContent>
            </Select>
            <Select value={hacizFilter} onValueChange={setHacizFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Haciz durumu filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Haciz Durumları</SelectItem>
                <SelectItem value="Hacizli Araç">Hacizli Araç</SelectItem>
                <SelectItem value="Rehinli Araç">Rehinli Araç</SelectItem>
                <SelectItem value="Yakalamalı / Şatış">Yakalamalı / Şatış</SelectItem>
                <SelectItem value="İpotekli / Gayrimenkul">İpotekli / Gayrimenkul</SelectItem>
                <SelectItem value="Hacizli / Gayrimenkul">Hacizli / Gayrimenkul</SelectItem>
              </SelectContent>
            </Select>
            <Select value={responsiblePersonFilter} onValueChange={setResponsiblePersonFilter}>
              <SelectTrigger className="w-full sm:w-48">
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

          <div className="overflow-x-auto">
            <div className="rounded-md border">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İcra</TableHead>
                  <TableHead>İcra Dosya No</TableHead>
                  <TableHead>Müvekkil</TableHead>
                  <TableHead>Karşı Taraf</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Haciz Durumu</TableHead>
                  <TableHead>Açılış Tarihi</TableHead>
                  <TableHead>Hatırlatma</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExecutions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      {statusFilter !== 'all' || hacizFilter !== 'all' || responsiblePersonFilter !== 'all' || görevlendirenFilter !== 'all' || executionTypeFilter !== 'all' ? 'Filtreleme kriterlerinize uygun icra bulunamadı.' : 'Henüz icra kaydı bulunmuyor.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExecutions.map((execution) => (
                    <TableRow key={execution.id}>
                      <TableCell className="font-medium">{execution.execution_office}</TableCell>
                      <TableCell>{execution.execution_number}</TableCell>
                      <TableCell>{execution.client_name}</TableCell>
                      <TableCell>{execution.defendant}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(execution.status)}>
                          {execution.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {execution.haciz_durumu ? (
                          <Badge variant="outline">
                            {execution.haciz_durumu}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(execution.start_date).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        {execution.reminder_date ? (
                          <div className="text-sm">
                            <div className="font-medium text-red-600">
                              {new Date(execution.reminder_date).toLocaleDateString('tr-TR')}
                            </div>
                            {execution.reminder_text && (
                              <div className="text-gray-500 truncate max-w-32">
                                {execution.reminder_text}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/executions/${execution.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(execution.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
