import { useEffect, useState } from 'react'
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
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_id: '',
    case_type: '',
    status: 'Devam Ediyor',
    court: '',
    case_number: '',
    start_date: '',
    next_hearing_date: '',
  })

  useEffect(() => {
    loadClients()
    if (isEdit && id) {
      loadCase(id)
    }
  }, [isEdit, id])

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

  const loadCase = async (caseId: string) => {
    try {
      const caseData = await api.cases.getById(caseId)
      setFormData({
        title: caseData.title,
        description: caseData.description,
        client_id: caseData.client_id,
        case_type: caseData.case_type,
        status: caseData.status,
        court: caseData.court,
        case_number: caseData.case_number,
        start_date: caseData.start_date,
        next_hearing_date: caseData.next_hearing_date || '',
      })
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
    setLoading(true)

    const formElement = e.target as HTMLFormElement
    const formDataObj = new FormData(formElement)
    
    const submissionData = {
      title: formDataObj.get('title') as string,
      description: formDataObj.get('description') as string,
      client_id: formDataObj.get('client_id') as string,
      case_type: formDataObj.get('case_type') as string,
      status: formDataObj.get('status') as string,
      court: formDataObj.get('court') as string,
      case_number: formDataObj.get('case_number') as string,
      start_date: formDataObj.get('start_date') as string,
      next_hearing_date: formDataObj.get('next_hearing_date') as string,
    }

    console.log('Form data before submission:', submissionData)

    try {
      if (isEdit && id) {
        const updateData: CaseUpdate = { ...submissionData }
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
          next_hearing_date: submissionData.next_hearing_date || undefined,
        }
        console.log('Create data:', createData)
        await api.cases.create(createData)
        toast({
          title: "Başarılı",
          description: "Dava başarıyla oluşturuldu.",
        })
      }
      navigate('/cases')
    } catch (error) {
      console.error('Submission error:', error)
      toast({
        title: "Hata",
        description: isEdit ? "Dava güncellenirken bir hata oluştu." : "Dava oluşturulurken bir hata oluştu.",
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
                <Label htmlFor="title">Dava Başlığı *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Dava başlığını girin"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="case_number">Dava Numarası *</Label>
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
                <Label htmlFor="case_type">Dava Türü *</Label>
                <Select value={formData.case_type} onValueChange={(value) => handleChange('case_type', value)} name="case_type">
                  <SelectTrigger>
                    <SelectValue placeholder="Dava türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hukuk">Hukuk</SelectItem>
                    <SelectItem value="Ceza">Ceza</SelectItem>
                    <SelectItem value="İdare">İdare</SelectItem>
                    <SelectItem value="İş Hukuku">İş Hukuku</SelectItem>
                    <SelectItem value="Aile Hukuku">Aile Hukuku</SelectItem>
                    <SelectItem value="Ticaret">Ticaret</SelectItem>
                    <SelectItem value="İcra">İcra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Durum *</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)} name="status">
                  <SelectTrigger>
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
                    <SelectItem value="Kazanıldı">Kazanıldı</SelectItem>
                    <SelectItem value="Kaybedildi">Kaybedildi</SelectItem>
                    <SelectItem value="Beklemede">Beklemede</SelectItem>
                    <SelectItem value="İptal Edildi">İptal Edildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="court">Mahkeme *</Label>
                <Input
                  id="court"
                  name="court"
                  value={formData.court}
                  onChange={(e) => handleChange('court', e.target.value)}
                  placeholder="Mahkeme adını girin"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Başlangıç Tarihi *</Label>
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
                <Label htmlFor="next_hearing_date">Sonraki Duruşma Tarihi</Label>
                <Input
                  id="next_hearing_date"
                  name="next_hearing_date"
                  type="date"
                  value={formData.next_hearing_date}
                  onChange={(e) => handleChange('next_hearing_date', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Dava hakkında detaylı açıklama girin"
                rows={4}
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate('/cases')}>
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Oluştur')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
