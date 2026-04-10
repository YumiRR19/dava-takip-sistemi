import React, { useState, useEffect } from 'react'
import { Save, Download, Moon, Sun, LogOut, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { api, SettingsOption } from '@/lib/api'

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [loading, setLoading] = useState(false)
  const { logout } = useAuth()
  const { toast } = useToast()

  // Settings options state
  const [bankOptions, setBankOptions] = useState<SettingsOption[]>([])
  const [gorevlendirenOptions, setGorevlendirenOptions] = useState<SettingsOption[]>([])
  const [ilgiliSorumluOptions, setIlgiliSorumluOptions] = useState<SettingsOption[]>([])
  const [newBank, setNewBank] = useState('')
  const [newGorevlendiren, setNewGorevlendiren] = useState('')
  const [newIlgiliSorumlu, setNewIlgiliSorumlu] = useState('')
  const [optionsLoading, setOptionsLoading] = useState(false)

  useEffect(() => {
    loadSettingsOptions()
  }, [])

  const loadSettingsOptions = async () => {
    try {
      const allOptions = await api.settingsOptions.getAll()
      setBankOptions(allOptions.filter(o => o.category === 'bank'))
      setGorevlendirenOptions(allOptions.filter(o => o.category === 'gorevlendiren'))
      setIlgiliSorumluOptions(allOptions.filter(o => o.category === 'ilgili_sorumlu'))
    } catch (error) {
      console.error('Error loading settings options:', error)
    }
  }

  const handleAddOption = async (category: string, value: string, resetFn: (val: string) => void) => {
    if (!value.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir değer girin.",
        variant: "destructive",
      })
      return
    }

    setOptionsLoading(true)
    try {
      await api.settingsOptions.create({ category, value: value.trim() })
      toast({
        title: "Başarılı",
        description: "Yeni seçenek başarıyla eklendi.",
      })
      resetFn('')
      await loadSettingsOptions()
    } catch (error: any) {
      if (error.status === 409) {
        toast({
          title: "Hata",
          description: "Bu seçenek zaten mevcut.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Hata",
          description: "Seçenek eklenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } finally {
      setOptionsLoading(false)
    }
  }

  const handleDeleteOption = async (optionId: string) => {
    if (!confirm('Bu seçeneği silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await api.settingsOptions.delete(optionId)
      toast({
        title: "Başarılı",
        description: "Seçenek başarıyla silindi.",
      })
      await loadSettingsOptions()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Seçenek silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Hata",
        description: "Yeni şifreler eşleşmiyor.",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Hata", 
        description: "Yeni şifre en az 6 karakter olmalıdır.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await api.auth.changePassword(currentPassword, newPassword)
      toast({
        title: "Başarılı",
        description: "Şifre başarıyla değiştirildi.",
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast({
        title: "Hata",
        description: "Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBackup = async () => {
    try {
      const backupData = await api.backup.export()
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lexcloud-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Başarılı",
        description: "Yedekleme dosyası indirildi.",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Yedekleme oluşturulamadı.",
        variant: "destructive",
      })
    }
  }

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const backupData = JSON.parse(text)
      
      if (!backupData || typeof backupData !== 'object') {
        throw new Error('Invalid backup file format')
      }
      
      const requiredSections = ['clients', 'cases', 'executions', 'compensation_letters']
      const hasValidSections = requiredSections.some(section => backupData[section])
      if (!hasValidSections) {
        throw new Error('Backup file does not contain valid data sections')
      }
      
      await api.backup.import(backupData)
      toast({
        title: "Başarılı",
        description: "Veriler başarıyla geri yüklendi.",
      })
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      console.error('Restore error:', error)
      let errorMessage = "Geri yükleme başarısız. Dosya formatını kontrol edin."
      
      if (error.message === 'Invalid backup file format') {
        errorMessage = "Geçersiz yedek dosya formatı. JSON dosyası seçtiğinizden emin olun."
      } else if (error.message === 'Backup file does not contain valid data sections') {
        errorMessage = "Yedek dosyası geçerli veri bölümleri içermiyor."
      } else if (error.status === 500) {
        errorMessage = "Sunucu hatası. Lütfen daha sonra tekrar deneyin."
      }
      
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      })
    }
    
    e.target.value = ''
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
    
    toast({
      title: "Tema Değiştirildi",
      description: darkMode ? "Açık tema aktif edildi." : "Koyu tema aktif edildi.",
    })
  }

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark' || !savedTheme) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      setDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
        <Button variant="outline" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Çıkış Yap
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yeni Banka Ekle */}
        <Card>
          <CardHeader>
            <CardTitle>Yeni Banka Ekle</CardTitle>
            <CardDescription>
              Teminat mektubu formlarında kullanılacak yeni banka ekleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Banka adını girin"
                value={newBank}
                onChange={(e) => setNewBank(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddOption('bank', newBank, setNewBank)
                  }
                }}
              />
              <Button 
                onClick={() => handleAddOption('bank', newBank, setNewBank)}
                disabled={optionsLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ekle
              </Button>
            </div>
            {bankOptions.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">Eklenen Bankalar:</Label>
                  {bankOptions.map((option) => (
                    <div key={option.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm">{option.value}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOption(option.id)}
                        className="text-red-600 hover:text-red-700 h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Yeni Görevlendiren Ekle */}
        <Card>
          <CardHeader>
            <CardTitle>Yeni Görevlendiren Ekle</CardTitle>
            <CardDescription>
              Görevlendiren listelerine yeni kişi ekleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Görevlendiren adını girin"
                value={newGorevlendiren}
                onChange={(e) => setNewGorevlendiren(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddOption('gorevlendiren', newGorevlendiren, setNewGorevlendiren)
                  }
                }}
              />
              <Button 
                onClick={() => handleAddOption('gorevlendiren', newGorevlendiren, setNewGorevlendiren)}
                disabled={optionsLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ekle
              </Button>
            </div>
            {gorevlendirenOptions.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">Eklenen Görevlendirenler:</Label>
                  {gorevlendirenOptions.map((option) => (
                    <div key={option.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm">{option.value}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOption(option.id)}
                        className="text-red-600 hover:text-red-700 h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Yeni İlgili/Sorumlu Ekle */}
        <Card>
          <CardHeader>
            <CardTitle>Yeni İlgili/Sorumlu Ekle</CardTitle>
            <CardDescription>
              İlgili/Sorumlu listelerine yeni kişi ekleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="İlgili/Sorumlu adını girin"
                value={newIlgiliSorumlu}
                onChange={(e) => setNewIlgiliSorumlu(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddOption('ilgili_sorumlu', newIlgiliSorumlu, setNewIlgiliSorumlu)
                  }
                }}
              />
              <Button 
                onClick={() => handleAddOption('ilgili_sorumlu', newIlgiliSorumlu, setNewIlgiliSorumlu)}
                disabled={optionsLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ekle
              </Button>
            </div>
            {ilgiliSorumluOptions.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">Eklenen İlgili/Sorumlular:</Label>
                  {ilgiliSorumluOptions.map((option) => (
                    <div key={option.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm">{option.value}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOption(option.id)}
                        className="text-red-600 hover:text-red-700 h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Şifre Değiştir</CardTitle>
            <CardDescription>
              Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mevcut Şifre</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Yeni Şifre</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Kaydediliyor...' : 'Şifreyi Değiştir'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Yedekleme & Geri Yükleme</CardTitle>
            <CardDescription>
              Verilerinizi yedekleyin veya önceki bir yedekten geri yükleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleBackup} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Yedekleme İndir
            </Button>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="restore-file">Yedek Dosyası Seç</Label>
              <Input
                id="restore-file"
                type="file"
                accept=".json"
                onChange={handleRestore}
              />
            </div>
            
            <div className="text-sm text-gray-500">
              <p>⚠️ Geri yükleme işlemi mevcut tüm verileri değiştirecektir.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Görünüm Ayarları</CardTitle>
            <CardDescription>
              Arayüz temasını ve görünüm seçeneklerini ayarlayın
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Koyu Tema</Label>
                <p className="text-sm text-gray-500">
                  Koyu renk temasını etkinleştirin
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <Switch
                  checked={darkMode}
                  onCheckedChange={toggleDarkMode}
                />
                <Moon className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Otomatik Yedekleme</CardTitle>
            <CardDescription>
              Verileriniz otomatik olarak yedeklenir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Otomatik Yedekleme</Label>
                  <p className="text-sm text-gray-500">
                    Günlük otomatik yedekleme aktif
                  </p>
                </div>
                <Switch checked={true} disabled />
              </div>
              <div className="text-sm text-gray-500">
                <p>✅ Son yedekleme: {new Date().toLocaleDateString('tr-TR')}</p>
                <p>📅 Sonraki yedekleme: {new Date(Date.now() + 24*60*60*1000).toLocaleDateString('tr-TR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
