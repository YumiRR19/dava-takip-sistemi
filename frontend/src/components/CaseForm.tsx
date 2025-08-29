import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api, Client, CaseCreate, CaseUpdate } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

export default function CaseForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [courtOpen, setCourtOpen] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    client_id: '',
    case_type: '',
    status: 'Derdest',
    court: '',
    case_number: '',
    defendant: '',
    notes: '',
    start_date: '',
    next_hearing_date: '',
    reminder_date: '',
    office_archive_no: '',
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
        description: caseData.description,
        client_id: caseData.client_id,
        case_type: caseData.case_type,
        status: caseData.status,
        court: caseData.court,
        case_number: caseData.case_number,
        defendant: caseData.defendant,
        notes: caseData.notes,
        start_date: caseData.start_date,
        next_hearing_date: caseData.next_hearing_date || '',
        reminder_date: caseData.reminder_date || '',
        office_archive_no: caseData.office_archive_no || '',
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
      title: formDataObj.get('case_number') as string,
      description: formDataObj.get('description') as string,
      client_id: formDataObj.get('client_id') as string,
      case_type: formDataObj.get('case_type') as string,
      status: formDataObj.get('status') as string,
      court: formDataObj.get('court') as string,
      case_number: formDataObj.get('case_number') as string,
      defendant: formDataObj.get('defendant') as string,
      notes: formDataObj.get('notes') as string,
      start_date: formDataObj.get('start_date') as string,
      next_hearing_date: formDataObj.get('next_hearing_date') as string,
      reminder_date: formDataObj.get('reminder_date') as string,
      office_archive_no: formDataObj.get('office_archive_no') as string,
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
                <Label htmlFor="court">Mahkeme / İcra *</Label>
                <Popover open={courtOpen} onOpenChange={setCourtOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={courtOpen}
                      className="w-full justify-between"
                    >
                      {formData.court || "Mahkeme seçin veya yazın..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Mahkeme ara veya yaz..." 
                        value={formData.court}
                        onValueChange={(value) => handleChange('court', value)}
                      />
                      <CommandList>
                        <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
                        <CommandGroup>
                          {[
                            "ADANA BANKA ALACAKLARI",
                            "GAYRİMENKUL SATIŞ İCRA DAİRESİ",
                            "ADANA 1.GENEL İCRA DAİRESİ",
                            "ADANA 2.GENEL İCRA DAİRESİ",
                            "ADANA 3.GENEL İCRA DAİRESİ",
                            "GAZİANTEP İCRA DAİRESİ"
                          ].map((court) => (
                            <CommandItem
                              key={court}
                              value={court}
                              onSelect={(currentValue) => {
                                handleChange('court', currentValue)
                                setCourtOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.court === court ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {court}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <input type="hidden" name="court" value={formData.court} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="case_number">Dava No *</Label>
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
                    <SelectItem value="Satış Memuru">Satış Memuru</SelectItem>
                    <SelectItem value="Ara Buluculuk">Ara Buluculuk</SelectItem>
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

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
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
