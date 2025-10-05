import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api, Client, CaseCreate, CaseUpdate } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

export default function CaseForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [clientsLoading, setClientsLoading] = useState(false)
  const [clientsError, setClientsError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [clients, setClients] = useState<Client[]>([])
  const requestIdRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [formData, setFormData] = useState({
    description: '',
    client_id: '',
    case_name: '',
    case_type: '',
    status: 'Derdest',
    court: '',
    case_number: '',
    defendant: '',
    notes: '',
    start_date: new Date().toISOString().split('T')[0],
    next_hearing_date: '',
    reminder_date: '',
    office_archive_no: '',
    responsible_person: '',
    görevlendiren: ''
  })
  const [currentVersion, setCurrentVersion] = useState<number>(1)

  useEffect(() => {
    loadClients()
    if (isEdit && id) {
      loadCase(id)
    }
  }, [isEdit, id])

  const loadClients = async (attempt = 1) => {
    const maxRetries = 3
    const timeout = 5000
    let active = true
    const requestId = ++requestIdRef.current
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    
    const t0 = Date.now()
    console.log(`[CaseForm] t0: fetch start at ${t0}, requestId=${requestId}`)
    
    try {
      setClientsLoading(true)
      setClientsError(null)
      
      const timeoutPromise = new Promise<'timeout'>((resolve) => 
        setTimeout(() => resolve('timeout'), timeout)
      )
      
      const fetchPromise = api.clients.getAll({ signal: abortControllerRef.current.signal }).catch(err => {
        if (err.name === 'AbortError') throw err
        throw new Error(`API Error: ${err.message || 'Unknown error'}`)
      })
      
      const result = await Promise.race([fetchPromise, timeoutPromise])
      
      if (!active || requestId !== requestIdRef.current) {
        console.log(`[CaseForm] Stale request ${requestId}, ignoring result`)
        return
      }
      
      const t1 = Date.now()
      console.log(`[CaseForm] t1: response at ${t1}, requestId=${requestId}`)
      
      if (result === 'timeout') {
        console.log(`[CaseForm] Timeout reached at ${t1}, but continuing to wait for data`)
        const lateResult = await fetchPromise.catch(() => null)
        if (lateResult && active && requestId === requestIdRef.current) {
          const t2 = Date.now()
          console.log(`[CaseForm] t2: setClients (late) at ${t2}, len=${lateResult.length}`)
          setClients(lateResult)
          setClientsError(null)
          if (lateResult.length > 0 && !formData.client_id) {
            setFormData(prev => ({ ...prev, client_id: lateResult[0].id }))
          }
        }
        return
      }
      
      const clientsData = result as Client[]
      const t2 = Date.now()
      console.log(`[CaseForm] t2: setClients at ${t2}, len=${clientsData.length}, requestId=${requestId}`)
      setClients(clientsData)
      setRetryCount(0)
      setClientsError(null)
      
      if (clientsData.length > 0 && !formData.client_id) {
        setFormData(prev => ({ ...prev, client_id: clientsData[0].id }))
      }
      
    } catch (error) {
      if (!active || requestId !== requestIdRef.current) {
        console.log(`[CaseForm] Stale error for request ${requestId}, ignoring`)
        return
      }
      
      console.error(`[CaseForm] Error loading clients (attempt ${attempt}):`, error)
      
      if (attempt < maxRetries) {
        const backoffDelay = Math.pow(2, attempt - 1) * 1000
        setTimeout(() => {
          if (active && requestId === requestIdRef.current) {
            setRetryCount(attempt)
            loadClients(attempt + 1)
          }
        }, backoffDelay)
        return
      }
      
      setClientsError("Müvekkiller yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.")
      setClientsLoading(false)
      toast({
        title: "Hata",
        description: "Müvekkiller yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      const t3 = Date.now()
      console.log(`[CaseForm] t3: setLoading(false) at ${t3}, requestId=${requestId}, current: ${requestIdRef.current}`)
      
      if (requestId === requestIdRef.current) {
        setClientsLoading(false)
      }
    }
    
    return () => { active = false }
  }

  const loadCase = async (caseId: string) => {
    try {
      const caseData = await api.cases.getById(caseId)
      setFormData({
        description: caseData.description || '',
        client_id: caseData.client_id,
        case_name: caseData.case_name || '',
        case_type: caseData.case_type,
        status: caseData.status,
        court: caseData.court,
        case_number: caseData.case_number,
        defendant: caseData.defendant,
        notes: caseData.notes || '',
        start_date: caseData.start_date ? new Date(caseData.start_date).toISOString().split('T')[0] : '',
        next_hearing_date: caseData.next_hearing_date ? new Date(caseData.next_hearing_date).toISOString().split('T')[0] : '',
        reminder_date: caseData.reminder_date ? new Date(caseData.reminder_date).toISOString().split('T')[0] : '',
        office_archive_no: caseData.office_archive_no || '',
        responsible_person: caseData.responsible_person || '',
        görevlendiren: caseData.görevlendiren || ''
      })
      setCurrentVersion(caseData.version)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Dava bilgileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
      navigate('/cases')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (clientsLoading) {
      toast({
        title: "Uyarı",
        description: "Müvekkiller yüklenirken lütfen bekleyin.",
        variant: "destructive",
      })
      return
    }

    if (!formData.client_id || !clients.find(c => c.id === formData.client_id)) {
      toast({
        title: "Hata",
        description: "Geçerli bir müvekkil seçiniz.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const submissionData = {
      title: formData.case_number,
      case_name: formData.case_name || undefined,
      description: formData.description,
      client_id: formData.client_id,
      case_type: formData.case_type,
      status: formData.status,
      court: formData.court,
      case_number: formData.case_number,
      defendant: formData.defendant,
      notes: formData.notes,
      start_date: formData.start_date,
      next_hearing_date: formData.next_hearing_date,
      reminder_date: formData.reminder_date,
      office_archive_no: formData.office_archive_no,
      responsible_person: formData.responsible_person || undefined,
      görevlendiren: formData.görevlendiren || undefined
    }

    console.log('Form data before submission:', submissionData)

    try {
      if (isEdit && id) {
        const updateData: CaseUpdate = { 
          ...submissionData,
          version: currentVersion
        }
        if (!updateData.next_hearing_date) {
          delete updateData.next_hearing_date
        }
        console.log('Update data:', updateData)
        await api.cases.update(id, updateData)
        toast({
          title: "Başarılı",
          description: "Dava başarıyla güncellendi.",
        })
      } else {
        const createData: CaseCreate = {
          ...submissionData,
          description: submissionData.description || undefined,
          notes: submissionData.notes || undefined,
          next_hearing_date: submissionData.next_hearing_date || undefined,
          reminder_date: submissionData.reminder_date || undefined,
        }
        console.log('Create data:', createData)
        await api.cases.create(createData)
        toast({
          title: "Başarılı",
          description: "Dava başarıyla oluşturuldu.",
        })
      }
      navigate('/cases')
    } catch (error: any) {
      console.error('Submission error:', error)
      if (error.status === 409) {
        toast({
          title: "Çakışma Hatası",
          description: "Bu kayıt başka bir kullanıcı tarafından değiştirilmiş. Lütfen sayfayı yenileyin ve tekrar deneyin.",
          variant: "destructive",
        })
        if (isEdit && id) {
          loadCase(id)
        }
      } else {
        const errorMessage = error.message || (isEdit ? "Dava güncellenirken bir hata oluştu." : "Dava oluşturulurken bir hata oluştu.")
        toast({
          title: "Hata",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate('/cases')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Dava Düzenle' : 'Yeni Dava'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Dava Bilgilerini Düzenle' : 'Yeni Dava Oluştur'}</CardTitle>
          <CardDescription>
            {isEdit ? 'Mevcut dava bilgilerini güncelleyin.' : 'Yeni bir dava kaydı oluşturun.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="client_id">Müvekkil *</Label>
                <Select 
                  key={`client-select-${clientsLoading}-${clients.length}-${!!clientsError}`}
                  value={formData.client_id} 
                  onValueChange={(value) => handleChange('client_id', value)} 
                  name="client_id"
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      clientsLoading ? "Müvekkiller yükleniyor..." :
                      clientsError ? "Hata oluştu" :
                      clients.length === 0 ? "Müvekkil bulunamadı" :
                      "Müvekkil seçin"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsError ? (
                      <div className="p-4 text-center">
                        <p className="text-sm text-red-600 mb-2">{clientsError}</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => loadClients()}
                          disabled={clientsLoading}
                        >
                          Tekrar Dene
                        </Button>
                      </div>
                    ) : clients.length === 0 && !clientsLoading ? (
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-600 mb-2">Henüz müvekkil eklenmemiş</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => navigate('/clients/new')}
                        >
                          Müvekkil Ekle
                        </Button>
                      </div>
                    ) : (
                      clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="case_name">Dava Adı</Label>
                <Input
                  id="case_name"
                  name="case_name"
                  value={formData.case_name}
                  onChange={(e) => handleChange('case_name', e.target.value)}
                  placeholder="Dava adını girin"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defendant">Karşı Taraf *</Label>
                <Input
                  id="defendant"
                  name="defendant"
                  value={formData.defendant}
                  onChange={(e) => handleChange('defendant', e.target.value)}
                  placeholder="Karşı taraf adını girin"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="court">Mahkeme *</Label>
                <Input
                  id="court"
                  name="court"
                  value={formData.court}
                  onChange={(e) => handleChange('court', e.target.value)}
                  placeholder="Mahkeme adını manuel olarak girin"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="case_number">Dava Dosya No *</Label>
                <Input
                  id="case_number"
                  name="case_number"
                  value={formData.case_number}
                  onChange={(e) => handleChange('case_number', e.target.value)}
                  placeholder="Dava numarasını girin"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Durum *</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)} name="status">
                  <SelectTrigger>
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beraat">Beraat</SelectItem>
                    <SelectItem value="Ceza">Ceza</SelectItem>
                    <SelectItem value="Kısmen kabul Kısmen red">Kısmen kabul Kısmen red</SelectItem>
                    <SelectItem value="Kabul">Kabul</SelectItem>
                    <SelectItem value="Red">Red</SelectItem>
                    <SelectItem value="Temyiz">Temyiz</SelectItem>
                    <SelectItem value="İstinaf">İstinaf</SelectItem>
                    <SelectItem value="Derdest">Derdest</SelectItem>
                    <SelectItem value="Kesinleştirme">Kesinleştirme</SelectItem>
                    <SelectItem value="G.K. Bekleniyor">Gerekli Karar Bekleniyor</SelectItem>
                    <SelectItem value="Bilirkişi">Bilirkişi</SelectItem>
                    <SelectItem value="Konkordato">Konkordato</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="case_type">Dava Türü *</Label>
                <Select value={formData.case_type} onValueChange={(value) => handleChange('case_type', value)} name="case_type">
                  <SelectTrigger>
                    <SelectValue placeholder="Dava türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ceza">Ceza</SelectItem>
                    <SelectItem value="Hukuk">Hukuk</SelectItem>
                    <SelectItem value="İcra">İcra</SelectItem>
                    <SelectItem value="İdari Yargı">İdari Yargı</SelectItem>
                    <SelectItem value="Satış Memurluğu">Satış Memurluğu</SelectItem>
                    <SelectItem value="Arabuluculuk">Arabuluculuk</SelectItem>
                    <SelectItem value="Cbs">Cbs</SelectItem>
                    <SelectItem value="Tazminat Komisyonu Başkanlığı">Tazminat Komisyonu Başkanlığı</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Açılış Tarihi *</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_hearing_date">Duruşma Tarihi</Label>
                <Input
                  id="next_hearing_date"
                  name="next_hearing_date"
                  type="date"
                  value={formData.next_hearing_date}
                  onChange={(e) => handleChange('next_hearing_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder_date">Hatırlatma Tarihi</Label>
                <Input
                  id="reminder_date"
                  name="reminder_date"
                  type="date"
                  value={formData.reminder_date}
                  onChange={(e) => handleChange('reminder_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="office_archive_no">Ofis Arşiv NO</Label>
                <Input
                  id="office_archive_no"
                  name="office_archive_no"
                  value={formData.office_archive_no}
                  onChange={(e) => handleChange('office_archive_no', e.target.value)}
                  placeholder="Ofis arşiv numarasını girin"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="görevlendiren">Görevlendiren</Label>
                <Select value={formData.görevlendiren} onValueChange={(value) => handleChange('görevlendiren', value)} name="görevlendiren">
                  <SelectTrigger>
                    <SelectValue placeholder="Görevlendiren seçin" />
                  </SelectTrigger>
                  <SelectContent>
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

              <div className="space-y-2">
                <Label htmlFor="responsible_person">İlgili/Sorumlu</Label>
                <Select value={formData.responsible_person} onValueChange={(value) => handleChange('responsible_person', value)} name="responsible_person">
                  <SelectTrigger>
                    <SelectValue placeholder="İlgili/Sorumlu seçin" />
                  </SelectTrigger>
                  <SelectContent>
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
            </div>


            <div className="space-y-2">
              <Label htmlFor="description">Hatırlatma Metni</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Dava hakkında detaylı açıklama girin"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Özel Not</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Dava ile ilgili özel notlarınızı buraya yazabilirsiniz"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate('/cases')}>
                İptal
              </Button>
              <Button type="submit" disabled={loading || clientsLoading || !formData.client_id}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Kaydediliyor...' : clientsLoading ? `Müvekkiller yükleniyor${retryCount > 0 ? ` (${retryCount}/3)` : ''}...` : (isEdit ? 'Güncelle' : 'Oluştur')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
