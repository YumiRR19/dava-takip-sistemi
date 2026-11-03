import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Edit, Trash2, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api, ApiError, ImportantReminder, SettingsOption } from '@/lib/api'
import { mergePersons } from '@/lib/responsible-persons'
import { useToast } from '@/hooks/use-toast'
import { useRealTimeData } from '@/hooks/use-real-time-data'

const NONE = '__none__'

const emptyForm = {
  responsible_person: '',
  görevlendiren: '',
  reminder_date: '',
  reminder_text: '',
}

export default function ImportantReminders() {
  const [reminders, setReminders] = useState<ImportantReminder[]>(() => api.importantReminders.peekAll() ?? [])
  const [loading, setLoading] = useState(() => !api.importantReminders.peekAll())
  const [options, setOptions] = useState<SettingsOption[]>(() => api.settingsOptions.peekAll() ?? [])
  const [responsibleFilter, setResponsibleFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ImportantReminder | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const { hasChangesForEntity, clearDataChanges } = useRealTimeData()

  const ilgiliSorumluList = useMemo(() => mergePersons(options.filter(o => o.category === 'ilgili_sorumlu')), [options])
  const gorevlendirenList = useMemo(() => mergePersons(options.filter(o => o.category === 'gorevlendiren')), [options])

  const loadReminders = useCallback(async () => {
    try {
      setReminders(await api.importantReminders.getAll())
    } catch {
      toast({ title: "Hata", description: "Önemli hatırlatmalar yüklenirken bir hata oluştu.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadReminders()
    api.settingsOptions.getAll().then(setOptions).catch((error) => console.error('Error loading custom options:', error))
  }, [loadReminders])

  useEffect(() => {
    if (hasChangesForEntity('important_reminder')) {
      loadReminders()
      clearDataChanges()
    }
  }, [hasChangesForEntity, clearDataChanges, loadReminders])

  const filteredReminders = useMemo(() => reminders
    .filter(r => responsibleFilter === 'all' || r.responsible_person === responsibleFilter)
    .sort((a, b) => Number(b.is_starred === true) - Number(a.is_starred === true)),
  [reminders, responsibleFilter])

  const openCreate = () => {
    setEditing(null)
    setFormData(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (reminder: ImportantReminder) => {
    setEditing(reminder)
    setFormData({
      responsible_person: reminder.responsible_person || '',
      görevlendiren: reminder.görevlendiren || '',
      reminder_date: reminder.reminder_date || '',
      reminder_text: reminder.reminder_text || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      responsible_person: formData.responsible_person || null,
      görevlendiren: formData.görevlendiren || null,
      reminder_date: formData.reminder_date || null,
      reminder_text: formData.reminder_text,
    }
    try {
      if (editing) {
        await api.importantReminders.update(editing.id, { ...payload, version: editing.version })
        toast({ title: "Başarılı", description: "Önemli hatırlatma güncellendi." })
      } else {
        await api.importantReminders.create(payload)
        toast({ title: "Başarılı", description: "Önemli hatırlatma oluşturuldu." })
      }
      setDialogOpen(false)
      await loadReminders()
    } catch (error) {
      const isConflict = error instanceof ApiError && error.status === 409
      toast({
        title: isConflict ? "Çakışma Hatası" : "Hata",
        description: isConflict
          ? "Bu kayıt başka bir kullanıcı tarafından değiştirilmiş. Lütfen sayfayı yenileyin ve tekrar deneyin."
          : "Önemli hatırlatma kaydedilirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (reminder: ImportantReminder) => {
    if (!confirm('Bu önemli hatırlatmayı silmek istediğinizden emin misiniz?')) return
    try {
      await api.importantReminders.delete(reminder.id)
      setReminders(prev => prev.filter(r => r.id !== reminder.id))
      toast({ title: "Başarılı", description: "Önemli hatırlatma silindi." })
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setReminders(prev => prev.filter(r => r.id !== reminder.id))
        return
      }
      toast({ title: "Hata", description: "Önemli hatırlatma silinirken bir hata oluştu.", variant: "destructive" })
    }
  }

  const toggleStar = async (reminder: ImportantReminder) => {
    try {
      await api.reminders.toggleStar('important_reminder', reminder.id)
      await loadReminders()
    } catch {
      toast({ title: "Hata", description: "Yıldız durumu güncellenirken bir hata oluştu.", variant: "destructive" })
    }
  }

  const personSelect = (field: 'responsible_person' | 'görevlendiren', list: string[], placeholder: string) => (
    <Select
      value={formData[field]}
      onValueChange={(value) => { if (value) setFormData(prev => ({ ...prev, [field]: value === NONE ? '' : value })) }}
    >
      <SelectTrigger id={field}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>Seçimi temizle</SelectItem>
        {(formData[field] && !list.includes(formData[field]) ? [...list, formData[field]] : list).map(person => (
          <SelectItem key={person} value={person}>{person}</SelectItem>
        ))}
      </SelectContent>
    </Select>
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
        <h1 className="text-3xl font-bold text-gray-900">Önemli Hatırlatmalar</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Önemli Hatırlatma
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Önemli Hatırlatmalar
              {responsibleFilter !== 'all' && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200" data-testid="important-reminder-count">
                  {filteredReminders.length} hatırlatma
                </span>
              )}
            </CardTitle>
            <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="İlgili / Sorumlu Seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Sorumlular</SelectItem>
                {ilgiliSorumluList.map(person => (
                  <SelectItem key={person} value={person}>{person}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredReminders.map(reminder => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onDoubleClick={() => openEdit(reminder)}
              >
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleStar(reminder) }}
                  className="flex-shrink-0 mr-3 focus:outline-none"
                  title={reminder.is_starred ? 'Yıldızı kaldır' : 'Yıldızla'}
                >
                  <Star className={`h-5 w-5 transition-colors ${reminder.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{reminder.reminder_text}</p>
                </div>
                <div className="text-right ml-4">
                  {reminder.görevlendiren && (
                    <p className="text-sm font-medium text-blue-600 mb-1">Görevlendiren: {reminder.görevlendiren}</p>
                  )}
                  {reminder.responsible_person && (
                    <p className="text-sm font-medium text-red-600 mb-1">İlgili/Sorumlu: {reminder.responsible_person}</p>
                  )}
                  {reminder.reminder_date && (
                    <p className="text-sm font-medium text-red-600">{new Date(reminder.reminder_date + 'T00:00:00').toLocaleDateString('tr-TR')}</p>
                  )}
                </div>
                <div className="flex items-center ml-3 space-x-1">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(reminder) }} title="Düzenle">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(reminder) }} title="Sil">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredReminders.length === 0 && (
              <p className="text-center py-4 text-sm text-gray-500">Önemli hatırlatma bulunmuyor.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Önemli Hatırlatmayı Güncelle' : 'Yeni Önemli Hatırlatma Oluştur'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="responsible_person">İlgili/Sorumlu Seç</Label>
              {personSelect('responsible_person', ilgiliSorumluList, 'İlgili/Sorumlu seçin')}
            </div>
            <div className="space-y-2">
              <Label htmlFor="görevlendiren">Görevlendiren Seç</Label>
              {personSelect('görevlendiren', gorevlendirenList, 'Görevlendiren seçin')}
            </div>
            <div className="space-y-2">
              <Label htmlFor="important_reminder_date">Önemli Hatırlatma Tarihi</Label>
              <Input
                id="important_reminder_date"
                type="date"
                value={formData.reminder_date}
                onChange={(e) => setFormData(prev => ({ ...prev, reminder_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="important_reminder_text">Önemli Hatırlatma Metni</Label>
              <Textarea
                id="important_reminder_text"
                value={formData.reminder_text}
                onChange={(e) => setFormData(prev => ({ ...prev, reminder_text: e.target.value }))}
                placeholder="Önemli hatırlatma metnini girin"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSave} disabled={saving || !formData.reminder_text.trim()}>
              {saving ? 'Kaydediliyor...' : (editing ? 'Güncelle' : 'Kaydet')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
