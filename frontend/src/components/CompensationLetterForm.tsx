import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { api, CompensationLetterCreate, CompensationLetterUpdate } from '@/lib/api'

export default function CompensationLetterForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    client_id: '',
    letter_number: '',
    bank: '',
    customer_number: '',
    customer: '',
    court: '',
    case_number: '',
    status: '',
    description_text: '',
    reminder_date: '',
    reminder_text: '',
    responsible_person: '',
    görevlendiren: ''
  })
  const [clients, setClients] = useState<any[]>([])
  const [clientsLoading, setClientsLoading] = useState(false)
  const [clientsError, setClientsError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [currentVersion, setCurrentVersion] = useState<number>(1)
  const requestIdRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)

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
    console.log(`[CompensationLetterForm] t0: fetch start at ${t0}, requestId=${requestId}`)
    
    try {
      setClientsLoading(true)
      setClientsError(null)
      
      const timeoutPromise = new Promise<string>((resolve) => 
        setTimeout(() => resolve('timeout'), timeout)
      )
      
      const fetchPromise = api.clients.getAll({ signal: abortControllerRef.current.signal }).catch(err => {
        if (err.name === 'AbortError') throw err
        throw new Error(`API Error: ${err.message || 'Unknown error'}`)
      })
      
      const result = await Promise.race([fetchPromise, timeoutPromise])
      
      if (!active || requestId !== requestIdRef.current) {
        console.log(`[CompensationLetterForm] Stale request ${requestId}, ignoring result`)
        return
      }

      const t1 = Date.now()
      console.log(`[CompensationLetterForm] t1: response at ${t1}, requestId=${requestId}`)
      
      if (result === 'timeout') {
        console.log(`[CompensationLetterForm] Timeout reached at ${t1}, but continuing to wait for data`)
        const lateResult = await fetchPromise.catch(() => null)
        if (lateResult && active && requestId === requestIdRef.current) {
          const t2 = Date.now()
          console.log(`[CompensationLetterForm] t2: setClients (late) at ${t2}, len=${lateResult.length}`)
          setClients(lateResult)
          setClientsError(null)
          setRetryCount(0)
        }
      } else {
        const t2 = Date.now()
        console.log(`[CompensationLetterForm] t2: setClients at ${t2}, len=${result.length}`)
        setClients(result as any[])
        setRetryCount(0)
        
        const t4 = Date.now()
        console.log(`[CompensationLetterForm] t4: setError(false) at ${t4}`)
        setClientsError(null)
      }
      
    } catch (error) {
      if (!active || requestId !== requestIdRef.current) {
        console.log(`[CompensationLetterForm] Stale error for request ${requestId}, ignoring`)
        return
      }
      
      console.error(`[CompensationLetterForm] Error loading clients (attempt ${attempt}):`, error)
      
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
      console.log(`[CompensationLetterForm] t3: setLoading(false) at ${t3}, requestId=${requestId}, current: ${requestIdRef.current}`)
      
      if (requestId === requestIdRef.current) {
        setClientsLoading(false)
      }
    }

    return () => {
      active = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }

  useEffect(() => {
    loadClients()
    if (isEdit && id) {
      loadLetter(id)
    }
  }, [id, isEdit])


  const loadLetter = async (letterId: string) => {
    try {
      const letter = await api.compensationLetters.getById(letterId)
      setFormData({
        client_id: letter.client_id,
        letter_number: letter.letter_number,
        bank: letter.bank,
        customer_number: letter.customer_number,
        customer: letter.customer,
        court: letter.court,
        case_number: letter.case_number,
        status: letter.status,
        description_text: letter.description_text || '',
        reminder_date: letter.reminder_date ? new Date(letter.reminder_date).toISOString().split('T')[0] : '',
        reminder_text: letter.reminder_text || '',
        responsible_person: letter.responsible_person || '',
        görevlendiren: letter.görevlendiren || ''
      })
      setCurrentVersion(letter.version)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Teminat mektubu yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
      navigate('/compensation-letters')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit && id) {
        const updateData: CompensationLetterUpdate = {
          client_id: formData.client_id,
          letter_number: formData.letter_number,
          bank: formData.bank,
          customer_number: formData.customer_number,
          customer: formData.customer,
          court: formData.court,
          case_number: formData.case_number,
          status: formData.status,
          description_text: formData.description_text || undefined,
          reminder_date: (formData.reminder_date && formData.reminder_date.length === 10) ? formData.reminder_date : undefined,
          reminder_text: formData.reminder_text || undefined,
          responsible_person: formData.responsible_person || undefined,
          görevlendiren: formData.görevlendiren || undefined,
          version: currentVersion
        }
        await api.compensationLetters.update(id, updateData)
        toast({
          title: "Başarılı",
          description: "Teminat mektubu başarıyla güncellendi.",
        })
      } else {
        const createData: CompensationLetterCreate = {
          client_id: formData.client_id,
          letter_number: formData.letter_number,
          bank: formData.bank,
          customer_number: formData.customer_number,
          customer: formData.customer,
          court: formData.court,
          case_number: formData.case_number,
          status: formData.status,
          description_text: formData.description_text || undefined,
          reminder_date: (formData.reminder_date && formData.reminder_date.length === 10) ? formData.reminder_date : undefined,
          reminder_text: formData.reminder_text || undefined,
          responsible_person: formData.responsible_person || undefined,
          görevlendiren: formData.görevlendiren || undefined
        }
        await api.compensationLetters.create(createData)
        toast({
          title: "Başarılı",
          description: "Teminat mektubu başarıyla oluşturuldu.",
        })
      }
      navigate('/compensation-letters')
    } catch (error: any) {
      if (error.status === 409) {
        toast({
          title: "Çakışma Hatası",
          description: "Bu kayıt başka bir kullanıcı tarafından değiştirilmiş. Lütfen sayfayı yenileyin ve tekrar deneyin.",
          variant: "destructive",
        })
        if (isEdit && id) {
          loadLetter(id)
        }
      } else {
        toast({
          title: "Hata",
          description: isEdit ? "Teminat mektubu güncellenirken bir hata oluştu." : "Teminat mektubu oluşturulurken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate('/compensation-letters')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Teminat Mektubu Düzenle' : 'Yeni Teminat Mektubu'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Teminat Mektubu Bilgilerini Düzenle' : 'Teminat Mektubu Bilgileri'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="client_id">Müvekkil *</Label>
                <Select
                  key={`client-select-${clientsLoading}-${clients.length}-${!!clientsError}`}
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                  required
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
                <Label htmlFor="letter_number">Mektup No *</Label>
                <Input
                  id="letter_number"
                  value={formData.letter_number}
                  onChange={(e) => setFormData({ ...formData, letter_number: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank">Banka *</Label>
                <Select
                  value={formData.bank}
                  onValueChange={(value) => setFormData({ ...formData, bank: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Banka seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TÜRKİYE VAKIFLAR BANKASI T.A.O.">TÜRKİYE VAKIFLAR BANKASI T.A.O.</SelectItem>
                    <SelectItem value="TÜRKİYE GARANTİ BANKASI A.Ş.">TÜRKİYE GARANTİ BANKASI A.Ş.</SelectItem>
                    <SelectItem value="ŞEKERBANK T.A.Ş.">ŞEKERBANK T.A.Ş.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_number">Müşteri No *</Label>
                <Input
                  id="customer_number"
                  value={formData.customer_number}
                  onChange={(e) => setFormData({ ...formData, customer_number: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer">Müşteri *</Label>
                <Input
                  id="customer"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="court">Mahkeme *</Label>
                <Input
                  id="court"
                  value={formData.court}
                  onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="case_number">Dosya No *</Label>
                <Input
                  id="case_number"
                  value={formData.case_number}
                  onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder_date">Hatırlatma Tarihi</Label>
                <Input
                  id="reminder_date"
                  type="date"
                  value={formData.reminder_date}
                  onChange={(e) => {
                    const dateValue = e.target.value
                    setFormData({ ...formData, reminder_date: dateValue })
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="görevlendiren">Görevlendiren</Label>
                <Select value={formData.görevlendiren} onValueChange={(value) => setFormData({ ...formData, görevlendiren: value })} name="görevlendiren">
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
                <Select value={formData.responsible_person} onValueChange={(value) => setFormData({ ...formData, responsible_person: value })} name="responsible_person">
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

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="status">Durumu *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="İADE">İADE</SelectItem>
                    <SelectItem value="İADE İSTENDİ">İADE İSTENDİ</SelectItem>
                    <SelectItem value="DEVAM EDİYOR">DEVAM EDİYOR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_text">Hatırlatma Metni</Label>
              <Input
                id="reminder_text"
                value={formData.reminder_text}
                onChange={(e) => setFormData({ ...formData, reminder_text: e.target.value })}
                placeholder="Hatırlatma metni girin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description_text">Açıklama Metni</Label>
              <textarea
                id="description_text"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description_text}
                onChange={(e) => setFormData({ ...formData, description_text: e.target.value })}
                placeholder="Açıklama metni girin"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate('/compensation-letters')}>
                İptal
              </Button>
              <Button type="submit" disabled={loading || clientsLoading || !formData.client_id}>
                {loading ? 'Kaydediliyor...' : clientsLoading ? `Müvekkiller yükleniyor${retryCount > 0 ? ` (${retryCount}/3)` : ''}...` : (isEdit ? 'Güncelle' : 'Oluştur')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
