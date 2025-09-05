import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { api, Client, ExecutionCreate, ExecutionUpdate } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

export default function ExecutionForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const { toast } = useToast()

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [clientsLoading, setClientsLoading] = useState(true)
  const [formData, setFormData] = useState({
    client_id: '',
    defendant: '',
    execution_office: '',
    execution_number: '',
    status: '',
    execution_type: 'İcra',
    start_date: '',
    office_archive_no: '',
    reminder_date: '',
    reminder_text: '',
    notes: '',
    haciz_durumu: '',
  })

  useEffect(() => {
    loadClients()
    if (isEdit && id) {
      loadExecution(id)
    }
  }, [isEdit, id])

  const loadClients = async () => {
    try {
      setClientsLoading(true)
      const clientsData = await api.clients.getAll()
      setClients(clientsData)
      if (clientsData.length > 0 && !formData.client_id) {
        setFormData(prev => ({ ...prev, client_id: clientsData[0].id }))
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Müvekkiller yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setClientsLoading(false)
    }
  }

  const loadExecution = async (executionId: string) => {
    try {
      const executionData = await api.executions.getById(executionId)
      setFormData({
        client_id: executionData.client_id,
        defendant: executionData.defendant,
        execution_office: executionData.execution_office,
        execution_number: executionData.execution_number,
        status: executionData.status,
        execution_type: executionData.execution_type,
        start_date: executionData.start_date ? new Date(executionData.start_date).toISOString().split('T')[0] : '',
        office_archive_no: executionData.office_archive_no || '',
        reminder_date: executionData.reminder_date ? new Date(executionData.reminder_date).toISOString().split('T')[0] : '',
        reminder_text: executionData.reminder_text || '',
        notes: executionData.notes || '',
        haciz_durumu: executionData.haciz_durumu || '',
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "İcra bilgileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
      navigate('/executions')
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
      client_id: formData.client_id,
      defendant: formData.defendant,
      execution_office: formData.execution_office,
      execution_number: formData.execution_number,
      status: formData.status,
      execution_type: formData.execution_type,
      start_date: formData.start_date,
      office_archive_no: formData.office_archive_no,
      reminder_date: formData.reminder_date || undefined,
      reminder_text: formData.reminder_text || undefined,
      notes: formData.notes || undefined,
      haciz_durumu: formData.haciz_durumu || undefined,
    }

    try {
      if (isEdit && id) {
        const updateData: ExecutionUpdate = { ...submissionData }
        if (!updateData.reminder_date) {
          delete updateData.reminder_date
        }
        await api.executions.update(id, updateData)
        toast({
          title: "Başarılı",
          description: "İcra başarıyla güncellendi.",
        })
      } else {
        const createData: ExecutionCreate = {
          ...submissionData,
          reminder_date: submissionData.reminder_date || undefined,
          reminder_text: submissionData.reminder_text || undefined,
          notes: submissionData.notes || undefined,
        }
        await api.executions.create(createData)
        toast({
          title: "Başarılı",
          description: "İcra başarıyla oluşturuldu.",
        })
      }
      navigate('/executions')
    } catch (error: any) {
      console.error('Submission error:', error)
      const errorMessage = error.message || (isEdit ? "İcra güncellenirken bir hata oluştu." : "İcra oluşturulurken bir hata oluştu.")
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      })
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
        <Button variant="outline" onClick={() => navigate('/executions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'İcra Düzenle' : 'Yeni İcra'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'İcra Bilgilerini Düzenle' : 'Yeni İcra Oluştur'}</CardTitle>
          <CardDescription>
            {isEdit ? 'Mevcut icra bilgilerini güncelleyin.' : 'Yeni bir icra kaydı oluşturun.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="client_id">Müvekkil *</Label>
                <Select value={formData.client_id} onValueChange={(value) => handleChange('client_id', value)} name="client_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Müvekkil seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label htmlFor="execution_office">İcra *</Label>
                <Select value={formData.execution_office} onValueChange={(value) => handleChange('execution_office', value)} name="execution_office">
                  <SelectTrigger>
                    <SelectValue placeholder="İcra seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADANA 1.GENEL İCRA">ADANA 1.GENEL İCRA</SelectItem>
                    <SelectItem value="ADANA 2.GENEL İCRA">ADANA 2.GENEL İCRA</SelectItem>
                    <SelectItem value="ADANA 3.GENEL İCRA">ADANA 3.GENEL İCRA</SelectItem>
                    <SelectItem value="ADANA BANKA ALACAKLARI İCRA DAİRESİ">ADANA BANKA ALACAKLARI İCRA DAİRESİ</SelectItem>
                    <SelectItem value="GAYRİMENKUL SATIŞ İCRA DAİRESİ">GAYRİMENKUL SATIŞ İCRA DAİRESİ</SelectItem>
                    <SelectItem value="GAZİANTEP İCRA DAİRESİ">GAZİANTEP İCRA DAİRESİ</SelectItem>
                    <SelectItem value="KAHRAMANMARAŞ İCRA DAİRESİ">KAHRAMANMARAŞ İCRA DAİRESİ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="execution_number">İcra No *</Label>
                <Input
                  id="execution_number"
                  name="execution_number"
                  value={formData.execution_number}
                  onChange={(e) => handleChange('execution_number', e.target.value)}
                  placeholder="İcra numarasını girin"
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
                    <SelectItem value="Derdest">Derdest</SelectItem>
                    <SelectItem value="İnfaz">İnfaz</SelectItem>
                    <SelectItem value="Haricen Tahsil">Haricen Tahsil</SelectItem>
                    <SelectItem value="İtirazlı">İtirazlı</SelectItem>
                    <SelectItem value="İcranın Geri Bırakılması">İcranın Geri Bırakılması</SelectItem>
                    <SelectItem value="Davalı">Davalı</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="execution_type">İcra Türü</Label>
                <Input
                  id="execution_type"
                  name="execution_type"
                  value={formData.execution_type}
                  onChange={(e) => handleChange('execution_type', e.target.value)}
                  placeholder="İcra türü"
                  readOnly
                />
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
                <Label htmlFor="office_archive_no">Ofis Arşiv No</Label>
                <Input
                  id="office_archive_no"
                  name="office_archive_no"
                  value={formData.office_archive_no}
                  onChange={(e) => handleChange('office_archive_no', e.target.value)}
                  placeholder="Ofis arşiv numarasını girin"
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
                <Label htmlFor="haciz_durumu">Haciz Durumu</Label>
                <Select value={formData.haciz_durumu} onValueChange={(value) => handleChange('haciz_durumu', value)} name="haciz_durumu">
                  <SelectTrigger>
                    <SelectValue placeholder="Haciz durumu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hacizli Araç">Hacizli Araç</SelectItem>
                    <SelectItem value="Yakalamalı">Yakalamalı</SelectItem>
                    <SelectItem value="Hacizli Gayrimenkul">Hacizli Gayrimenkul</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_text">Hatırlatma Metni</Label>
              <Textarea
                id="reminder_text"
                name="reminder_text"
                value={formData.reminder_text}
                onChange={(e) => handleChange('reminder_text', e.target.value)}
                placeholder="Hatırlatma metni girin"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Özel Notlar</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="İcra ile ilgili özel notlarınızı buraya yazabilirsiniz"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate('/executions')}>
                İptal
              </Button>
              <Button type="submit" disabled={loading || clientsLoading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Kaydediliyor...' : clientsLoading ? 'Müvekkiller yükleniyor...' : (isEdit ? 'Güncelle' : 'Oluştur')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
