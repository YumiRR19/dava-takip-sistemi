import { useState, useEffect } from 'react'
import { Search, Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api, Client, Case, CaseSearchParams } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

export default function CaseSearch() {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [searchResults, setSearchResults] = useState<Case[]>([])
  const [searchParams, setSearchParams] = useState<CaseSearchParams>({
    case_type: '',
    status: '',
    court: '',
    client_id: '',
    start_date_from: '',
    start_date_to: '',
  })
  const { toast } = useToast()

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const clientsData = await api.clients.getAll()
      setClients(clientsData)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Müvekkiller yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const filteredParams: CaseSearchParams = {}
      
      if (searchParams.case_type) filteredParams.case_type = searchParams.case_type
      if (searchParams.status) filteredParams.status = searchParams.status
      if (searchParams.court) filteredParams.court = searchParams.court
      if (searchParams.client_id) filteredParams.client_id = searchParams.client_id
      if (searchParams.start_date_from) filteredParams.start_date_from = searchParams.start_date_from
      if (searchParams.start_date_to) filteredParams.start_date_to = searchParams.start_date_to

      const results = await api.cases.search(filteredParams)
      setSearchResults(results)
      
      toast({
        title: "Başarılı",
        description: `${results.length} dava bulundu.`,
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Arama sırasında bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (searchResults.length === 0) {
      toast({
        title: "Uyarı",
        description: "Dışa aktarılacak dava bulunamadı.",
        variant: "destructive",
      })
      return
    }

    const headers = [
      'Dava Başlığı',
      'Dava No',
      'Müvekkil',
      'Karşı Taraf',
      'Mahkeme/İcra',
      'Dava Türü',
      'Durum',
      'Açılış Tarihi',
      'Duruşma Tarihi',
      'Hatırlatma Tarihi',
      'Ofis Arşiv No',
      'Açıklama',
      'Notlar'
    ]

    const csvContent = [
      headers.join(','),
      ...searchResults.map(case_ => [
        `"${case_.title}"`,
        `"${case_.case_number}"`,
        `"${case_.client_name}"`,
        `"${case_.defendant}"`,
        `"${case_.court}"`,
        `"${case_.case_type}"`,
        `"${case_.status}"`,
        `"${case_.start_date}"`,
        `"${case_.next_hearing_date || ''}"`,
        `"${case_.reminder_date || ''}"`,
        `"${case_.office_archive_no || ''}"`,
        `"${case_.description}"`,
        `"${case_.notes}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `dava-sorgulama-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Başarılı",
      description: "Dava listesi CSV formatında indirildi.",
    })
  }

  const handleParamChange = (field: keyof CaseSearchParams, value: string) => {
    setSearchParams(prev => ({ ...prev, [field]: value === 'all' ? undefined : value || undefined }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dava Sorgulama</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arama Filtreleri</CardTitle>
          <CardDescription>
            Davaları filtrelemek için aşağıdaki kriterleri kullanın.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="case_type">Dava Türü</Label>
              <Select value={searchParams.case_type || ''} onValueChange={(value) => handleParamChange('case_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Dava türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="Ceza">Ceza</SelectItem>
                  <SelectItem value="Hukuk">Hukuk</SelectItem>
                  <SelectItem value="İcra">İcra</SelectItem>
                  <SelectItem value="İdari Yargı">İdari Yargı</SelectItem>
                  <SelectItem value="Satış Memuru">Satış Memuru</SelectItem>
                  <SelectItem value="Ara Buluculuk">Ara Buluculuk</SelectItem>
                  <SelectItem value="Tazminat Komisyonu Başkanlığı">Tazminat Komisyonu Başkanlığı</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Durum</Label>
              <Select value={searchParams.status || ''} onValueChange={(value) => handleParamChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="Beraat">Beraat</SelectItem>
                  <SelectItem value="Ceza">Ceza</SelectItem>
                  <SelectItem value="Kısmen kabul Kısmen red">Kısmen kabul Kısmen red</SelectItem>
                  <SelectItem value="Kabul">Kabul</SelectItem>
                  <SelectItem value="Red">Red</SelectItem>
                  <SelectItem value="İnfaz">İnfaz</SelectItem>
                  <SelectItem value="Temyiz">Temyiz</SelectItem>
                  <SelectItem value="İstinaf">İstinaf</SelectItem>
                  <SelectItem value="İtirazlı">İtirazlı</SelectItem>
                  <SelectItem value="Derdest">Derdest</SelectItem>
                  <SelectItem value="Protokollü">Protokollü</SelectItem>
                  <SelectItem value="Sözlü Taahütlü">Sözlü Taahütlü</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="court">Mahkeme/İcra</Label>
              <Input
                id="court"
                value={searchParams.court || ''}
                onChange={(e) => handleParamChange('court', e.target.value)}
                placeholder="Mahkeme adı girin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Müvekkil</Label>
              <Select value={searchParams.client_id || ''} onValueChange={(value) => handleParamChange('client_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Müvekkil seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date_from">Açılış Tarihi (Başlangıç)</Label>
              <Input
                id="start_date_from"
                type="date"
                value={searchParams.start_date_from || ''}
                onChange={(e) => handleParamChange('start_date_from', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date_to">Açılış Tarihi (Bitiş)</Label>
              <Input
                id="start_date_to"
                type="date"
                value={searchParams.start_date_to || ''}
                onChange={(e) => handleParamChange('start_date_to', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button type="button" variant="outline" onClick={() => setSearchParams({})}>
              Temizle
            </Button>
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Aranıyor...' : 'Ara'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Arama Sonuçları</CardTitle>
                <CardDescription>
                  {searchResults.length} dava bulundu
                </CardDescription>
              </div>
              <Button onClick={handleExportCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                CSV İndir
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((case_) => (
                <Card key={case_.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{case_.title}</p>
                      <p className="text-xs text-blue-600 font-medium">Dava No: {case_.case_number}</p>
                      <p className="text-xs text-gray-500">Müvekkil: {case_.client_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Karşı Taraf: {case_.defendant}</p>
                      <p className="text-xs text-gray-500">Mahkeme: {case_.court}</p>
                      <p className="text-xs text-orange-600 font-medium">Durum: {case_.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tür: {case_.case_type}</p>
                      <p className="text-xs text-gray-500">Açılış: {new Date(case_.start_date).toLocaleDateString('tr-TR')}</p>
                      {case_.next_hearing_date && (
                        <p className="text-xs text-red-600">Duruşma: {new Date(case_.next_hearing_date).toLocaleDateString('tr-TR')}</p>
                      )}
                    </div>
                  </div>
                  {case_.description && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-gray-600">{case_.description}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
