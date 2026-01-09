import React, { useState } from 'react'
import { Save, Download, Moon, Sun, LogOut, Globe } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { Language } from '@/i18n/translations'

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [loading, setLoading] = useState(false)
  const { logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { toast } = useToast()

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    toast({
      title: t.settings.languageChanged,
      description: t.languages[newLanguage === 'tr' ? 'turkish' : newLanguage === 'en' ? 'english' : 'german'],
    })
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast({
        title: t.common.error,
        description: t.settings.passwordMismatch,
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: t.common.error, 
        description: t.settings.passwordTooShort,
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await api.auth.changePassword(currentPassword, newPassword)
      toast({
        title: t.common.success,
        description: t.settings.passwordChanged,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.settings.passwordChangeError,
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
        title: t.common.success,
        description: t.settings.backupDownloaded,
      })
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.settings.backupError,
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
        title: t.common.success,
        description: t.settings.dataRestored,
      })
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      console.error('Restore error:', error)
      let errorMessage = t.settings.restoreError
      
      if (error.message === 'Invalid backup file format') {
        errorMessage = t.settings.invalidBackupFormat
      } else if (error.message === 'Backup file does not contain valid data sections') {
        errorMessage = t.settings.invalidBackupSections
      } else if (error.status === 500) {
        errorMessage = t.settings.serverError
      }
      
      toast({
        title: t.common.error,
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
      title: t.settings.themeChanged,
      description: darkMode ? t.settings.lightThemeEnabled : t.settings.darkThemeEnabled,
    })
  }

  const getDateLocale = () => {
    if (language === 'tr') return 'tr-TR'
    if (language === 'de') return 'de-DE'
    return 'en-US'
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
        <h1 className="text-3xl font-bold text-gray-900">{t.settings.title}</h1>
        <Button variant="outline" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          {t.settings.logout}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.settings.changePassword}</CardTitle>
            <CardDescription>
              {t.settings.changePasswordDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">{t.settings.currentPassword}</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">{t.settings.newPassword}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t.settings.confirmNewPassword}</Label>
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
                {loading ? t.common.saving : t.settings.savePassword}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.settings.backupRestore}</CardTitle>
            <CardDescription>
              {t.settings.backupRestoreDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleBackup} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              {t.settings.downloadBackup}
            </Button>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="restore-file">{t.settings.selectBackupFile}</Label>
              <Input
                id="restore-file"
                type="file"
                accept=".json"
                onChange={handleRestore}
              />
            </div>
            
            <div className="text-sm text-gray-500">
              <p>{t.settings.restoreWarning}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.settings.appearance}</CardTitle>
            <CardDescription>
              {t.settings.appearanceDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t.settings.darkTheme}</Label>
                <p className="text-sm text-gray-500">
                  {t.settings.enableDarkTheme}
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
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t.settings.language}
            </CardTitle>
            <CardDescription>
              {t.settings.languageDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t.settings.selectLanguage}</Label>
                <Select value={language} onValueChange={(value) => handleLanguageChange(value as Language)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tr">{t.languages.turkish}</SelectItem>
                    <SelectItem value="en">{t.languages.english}</SelectItem>
                    <SelectItem value="de">{t.languages.german}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.settings.autoBackup}</CardTitle>
            <CardDescription>
              {t.settings.autoBackupDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.settings.autoBackupEnabled}</Label>
                  <p className="text-sm text-gray-500">
                    {t.settings.dailyAutoBackupActive}
                  </p>
                </div>
                <Switch checked={true} disabled />
              </div>
              <div className="text-sm text-gray-500">
                <p>{t.settings.lastBackup}: {new Date().toLocaleDateString(getDateLocale())}</p>
                <p>{t.settings.nextBackup}: {new Date(Date.now() + 24*60*60*1000).toLocaleDateString(getDateLocale())}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
