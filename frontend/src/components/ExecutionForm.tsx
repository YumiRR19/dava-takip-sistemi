import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Check, ChevronsUpDown, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { api, ExecutionCreate, ExecutionUpdate } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useFormAutosave } from '@/hooks/use-form-autosave'
import { cn } from '@/lib/utils'

export default function ExecutionForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    client_id: '',
    client_name: '',
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
    haciz_reminder_date: '',
    haciz_reminder_text: '',
    related_case_id: '',
    responsible_person: '',
    görevlendiren: '',
    is_starred: false
  })
  const [currentVersion, setCurrentVersion] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [executionOfficeOpen, setExecutionOfficeOpen] = useState(false)
  
  const { loadDraft, clearDraft } = useFormAutosave({
    key: `execution_${id || 'new'}`,
    data: formData,
    enabled: !loading
  })

  useEffect(() => {
    if (isEdit && id) {
      loadExecution(id)
    } else {
      const draft = loadDraft()
      if (draft) {
        setFormData(prev => ({ ...prev, ...draft }))
      }
    }
  }, [isEdit, id])

  const loadExecution = async (executionId: string) => {
    try {
      const executionData = await api.executions.getById(executionId)
      setFormData({
        client_id: executionData.client_id || '',
        client_name: executionData.client_name || '',
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
        haciz_reminder_date: executionData.haciz_reminder_date ? new Date(executionData.haciz_reminder_date).toISOString().split('T')[0] : '',
        haciz_reminder_text: executionData.haciz_reminder_text || '',
        related_case_id: executionData.related_case_id || '',
        responsible_person: executionData.responsible_person || '',
        görevlendiren: executionData.görevlendiren || '',
        is_starred: executionData.is_starred || false
      })
      setCurrentVersion(executionData.version)
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
    
    if (!formData.client_name || formData.client_name.trim() === '') {
      toast({
        title: "Hata",
        description: "Lütfen alacaklı adını giriniz.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const submissionData = {
      client_name: formData.client_name.trim(),
      defendant: formData.defendant,
      execution_office: formData.execution_office,
      execution_number: formData.execution_number,
      status: formData.status,
      execution_type: formData.execution_type,
      start_date: formData.start_date,
      office_archive_no: formData.office_archive_no,
      reminder_date: formData.reminder_date || null,
      reminder_text: formData.reminder_text || undefined,
      notes: formData.notes || undefined,
      haciz_durumu: formData.haciz_durumu || undefined,
      haciz_reminder_date: formData.haciz_reminder_date || null,
      haciz_reminder_text: formData.haciz_reminder_text || undefined,
      related_case_id: formData.related_case_id || undefined,
      responsible_person: formData.responsible_person || undefined,
      görevlendiren: formData.görevlendiren || undefined,
      is_starred: formData.is_starred
    }

    try {
      if (isEdit && id) {
        const updateData: ExecutionUpdate = { 
          ...submissionData,
          version: currentVersion
        }
        if (!updateData.reminder_date) {
          (updateData as any).reminder_date = null
        }
        if (!updateData.haciz_reminder_date) {
          (updateData as any).haciz_reminder_date = null
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
        clearDraft()
      }
      navigate('/executions')
    } catch (error: any) {
      console.error('Submission error:', error)
      if (error.status === 409) {
        toast({
          title: "Çakışma Hatası",
          description: "Bu kayıt başka bir kullanıcı tarafından değiştirilmiş. Lütfen sayfayı yenileyin ve tekrar deneyin.",
          variant: "destructive",
        })
        if (isEdit && id) {
          loadExecution(id)
        }
      } else {
        const errorMessage = error.message || (isEdit ? "İcra güncellenirken bir hata oluştu." : "İcra oluşturulurken bir hata oluştu.")
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
            {/* Row 1: Alacaklı / Borçlu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="client_name">Alacaklı *</Label>
                <Input
                  id="client_name"
                  name="client_name"
                  value={formData.client_name}
                  onChange={(e) => handleChange('client_name', e.target.value)}
                  placeholder="Alacaklı adını girin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defendant">Borçlu *</Label>
                <Input
                  id="defendant"
                  name="defendant"
                  value={formData.defendant}
                  onChange={(e) => handleChange('defendant', e.target.value)}
                  placeholder="Borçlu adını girin"
                  required
                />
              </div>
            </div>

            {/* Row 2: İcra / İcra Dosya No */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="execution_office">İcra *</Label>
                <Popover open={executionOfficeOpen} onOpenChange={setExecutionOfficeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={executionOfficeOpen}
                      className="w-full justify-between"
                    >
                      {formData.execution_office || "İcra dairesi seçin veya yazın..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput 
                        placeholder="İcra dairesi ara veya yaz..." 
                        value={formData.execution_office}
                        onValueChange={(value) => handleChange('execution_office', value)}
                      />
                      <CommandList>
                        <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
                        <CommandGroup>
                          {[
                            "ADANA 1.GENEL İCRA",
                            "ADANA 2.GENEL İCRA",
                            "ADANA 3.GENEL İCRA",
                            "ADANA BANKA ALACAKLARI İCRA DAİRESİ",
                            "GAYRİMENKUL SATIŞ İCRA DAİRESİ",
                            "GAZİANTEP İCRA DAİRESİ",
                            "KAHRAMANMARAŞ İCRA DAİRESİ"
                          ].map((office) => (
                            <CommandItem
                              key={office}
                              value={office}
                              onSelect={(currentValue) => {
                                handleChange('execution_office', currentValue)
                                setExecutionOfficeOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.execution_office === office ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {office}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="execution_number">İcra Dosya No *</Label>
                <Input
                  id="execution_number"
                  name="execution_number"
                  value={formData.execution_number}
                  onChange={(e) => handleChange('execution_number', e.target.value)}
                  placeholder="İcra numarasını girin"
                  required
                />
              </div>
            </div>

            {/* Row 3: Durum / İcra Türü */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <SelectItem value="Ödeme Sözü">Ödeme Sözü</SelectItem>
                    <SelectItem value="Bilirkişi">Bilirkişi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="execution_type">İcra Türü *</Label>
                <Select value={formData.execution_type} onValueChange={(value) => handleChange('execution_type', value)} name="execution_type">
                  <SelectTrigger>
                    <SelectValue placeholder="İcra türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
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
              </div>
            </div>

            {/* Row 4: Açılış Tarihi / Ofis Arşiv No */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            {/* Row 5: Görevlendiren / İlgili / Sorumlu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label htmlFor="responsible_person">İlgili / Sorumlu</Label>
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

            {/* Row 6: Haciz Durumu / Hatırlatmalarda Yıldızla */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="haciz_durumu">Haciz Durumu</Label>
                <Select value={formData.haciz_durumu} onValueChange={(value) => handleChange('haciz_durumu', value)} name="haciz_durumu">
                  <SelectTrigger>
                    <SelectValue placeholder="Haciz durumu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hacizli Araç">Hacizli Araç</SelectItem>
                    <SelectItem value="Rehinli Araç">Rehinli Araç</SelectItem>
                    <SelectItem value="Yakalamalı / Şatış">Yakalamalı / Şatış</SelectItem>
                    <SelectItem value="İpotekli / Gayrimenkul">İpotekli / Gayrimenkul</SelectItem>
                    <SelectItem value="Hacizli / Gayrimenkul">Hacizli / Gayrimenkul</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hatırlatmalarda Yıldızla</Label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_starred: !prev.is_starred }))}
                  className="flex items-center space-x-2 p-2 rounded-md border hover:bg-gray-50 transition-colors w-full"
                >
                  <Star
                    className={`h-5 w-5 transition-colors ${
                      formData.is_starred
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  />
                  <span className="text-sm">{formData.is_starred ? 'Yıldızlı' : 'Yıldızla'}</span>
                </button>
              </div>
            </div>

            {/* Full-width: İşlem Hatırlatma Tarihi */}
            <div className="space-y-2">
              <Label htmlFor="reminder_date">İşlem Hatırlatma Tarihi</Label>
              <Input
                id="reminder_date"
                name="reminder_date"
                type="date"
                value={formData.reminder_date}
                onChange={(e) => handleChange('reminder_date', e.target.value)}
              />
            </div>

            {/* Full-width: İşlem Hatırlatma Metni */}
            <div className="space-y-2">
              <Label htmlFor="reminder_text">İşlem Hatırlatma Metni</Label>
              <Textarea
                id="reminder_text"
                name="reminder_text"
                value={formData.reminder_text}
                onChange={(e) => handleChange('reminder_text', e.target.value)}
                placeholder="İşlem hatırlatma metni girin"
                rows={3}
              />
            </div>

            {/* Full-width: Haciz Hatırlatma Tarihi */}
            <div className="space-y-2">
              <Label htmlFor="haciz_reminder_date">Haciz Hatırlatma Tarihi</Label>
              <Input
                id="haciz_reminder_date"
                name="haciz_reminder_date"
                type="date"
                value={formData.haciz_reminder_date}
                onChange={(e) => handleChange('haciz_reminder_date', e.target.value)}
              />
            </div>

            {/* Full-width: Haciz Hatırlatma Metni */}
            <div className="space-y-2">
              <Label htmlFor="haciz_reminder_text">Haciz Hatırlatma Metni</Label>
              <Textarea
                id="haciz_reminder_text"
                name="haciz_reminder_text"
                value={formData.haciz_reminder_text}
                onChange={(e) => handleChange('haciz_reminder_text', e.target.value)}
                placeholder="Haciz hatırlatma metni girin"
                rows={3}
              />
            </div>

            {/* Full-width: Özel Notlar */}
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

            {/* Full-width: İlgili Dava */}
            <div className="space-y-2">
              <Label htmlFor="related_case_id">İlgili Dava</Label>
              <Input
                id="related_case_id"
                name="related_case_id"
                value={formData.related_case_id}
                onChange={(e) => handleChange('related_case_id', e.target.value)}
                placeholder="İlgili dava ID'sini girin"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate('/executions')}>
                İptal
              </Button>
              <Button type="submit" disabled={loading || !formData.client_name.trim()}>
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
