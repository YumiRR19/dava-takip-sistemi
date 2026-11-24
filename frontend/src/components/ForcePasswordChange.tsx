import React, { useState } from 'react'
import { KeyRound, LogOut } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'

export default function ForcePasswordChange() {
  const { account, logout, refreshAccount } = useAuth()
  const { toast } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({ title: 'Hata', description: 'Yeni şifreler eşleşmiyor.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      await api.auth.changePassword(currentPassword, newPassword)
      toast({ title: 'Başarılı', description: 'Şifreniz kaydedildi. Geçici şifre artık geçersiz.' })
      await refreshAccount()
    } catch (error) {
      toast({
        title: 'Hata',
        description: error instanceof Error && error.message ? error.message : 'Şifre kaydedilemedi.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Kendi Şifrenizi Belirleyin
          </CardTitle>
          <CardDescription>
            Kullanıcı No: <span className="font-mono">{account?.userNo}</span>. Devam etmeden önce geçici şifrenizi kendi şifrenizle değiştirin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="temp-password">Geçici Şifre</Label>
              <Input id="temp-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="first-new-password">Yeni Şifre</Label>
              <Input id="first-new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              <p className="text-xs text-gray-500">En az 8 karakter; en az bir harf ve bir rakam.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="first-confirm-password">Yeni Şifre (Tekrar)</Label>
              <Input id="first-confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Kaydediliyor...' : 'Şifremi Kaydet'}
              </Button>
              <Button type="button" variant="outline" onClick={logout}>
                <LogOut className="mr-1 h-4 w-4" />
                Çıkış
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
