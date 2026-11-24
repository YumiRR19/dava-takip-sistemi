import React, { useCallback, useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Copy, KeyRound, LogOut, MonitorSmartphone, Plus, RefreshCw, Scale, ShieldCheck, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { api, AdminAccount, AdminAuditEntry, IssuedCredentials } from '@/lib/api'

const fmt = (iso: string | null | undefined) => (iso ? new Date(iso.endsWith('Z') ? iso : `${iso}Z`).toLocaleString('tr-TR') : '—')

const SESSION_STATUS: Record<string, string> = {
  active: 'Aktif',
  expired: 'Süresi doldu',
  logout: 'Çıkış yapıldı',
  revoked: 'Kapatıldı',
  replaced: 'Yeni girişle yenilendi',
  password_changed: 'Şifre değişikliğiyle kapandı',
  password_reset: 'Şifre sıfırlamayla kapandı',
}

const AUDIT_ACTIONS: Record<string, string> = {
  admin_login: 'Yönetici girişi',
  admin_logout: 'Yönetici çıkışı',
  admin_password_changed: 'Yönetici şifresi değiştirildi',
  create_user: 'Yeni kullanıcı oluşturuldu',
  reset_password: 'Geçici şifre oluşturuldu (şifre sıfırlama)',
  revoke_session: 'Oturum kapatıldı',
  revoke_all_sessions: 'Tüm oturumlar kapatıldı',
}

function accountName(a: AdminAccount) {
  if (a.account_type === 'admin') return 'Yönetici (siz)'
  if (a.is_legacy) return a.label || 'Mevcut LexCloud hesabı'
  return a.label || 'Standart kullanıcı'
}

export default function AdminPanel() {
  const { account, logout } = useAuth()
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<AdminAccount[]>([])
  const [audit, setAudit] = useState<AdminAuditEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [newUserOpen, setNewUserOpen] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [issued, setIssued] = useState<(IssuedCredentials & { title: string }) | null>(null)
  const [busy, setBusy] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const errorToast = (error: unknown, fallback: string) =>
    toast({ title: 'Hata', description: error instanceof Error && error.message ? error.message : fallback, variant: 'destructive' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [acc, log] = await Promise.all([api.admin.listAccounts(), api.admin.auditLog()])
      setAccounts(acc)
      setAudit(log)
    } catch (error) {
      errorToast(error, 'Veriler yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const createUser = async () => {
    setBusy(true)
    try {
      const created = await api.admin.createAccount(newLabel.trim())
      setNewUserOpen(false)
      setNewLabel('')
      setIssued({ ...created, title: 'Yeni kullanıcı oluşturuldu' })
      load()
    } catch (error) {
      errorToast(error, 'Kullanıcı oluşturulamadı.')
    } finally {
      setBusy(false)
    }
  }

  const resetPassword = async (a: AdminAccount) => {
    if (!window.confirm(`${a.user_no} için yeni geçici şifre oluşturulsun mu? Mevcut şifre geçersiz olur ve hesabın tüm oturumları kapatılır.`)) return
    try {
      const creds = await api.admin.resetPassword(a.id)
      setIssued({ ...creds, title: 'Yeni geçici şifre oluşturuldu' })
      load()
    } catch (error) {
      errorToast(error, 'Geçici şifre oluşturulamadı.')
    }
  }

  const revokeSession = async (sessionId: string) => {
    try {
      await api.admin.revokeSession(sessionId)
      toast({ title: 'Oturum kapatıldı' })
      load()
    } catch (error) {
      errorToast(error, 'Oturum kapatılamadı.')
    }
  }

  const revokeAll = async (a: AdminAccount) => {
    const self = a.account_type === 'admin'
    if (!window.confirm(self ? 'Bu cihaz dışındaki tüm yönetici oturumları kapatılsın mı?' : `${a.user_no} hesabının tüm oturumları kapatılsın mı?`)) return
    try {
      const r = await api.admin.revokeAllSessions(a.id)
      toast({ title: `${r.closed_sessions} oturum kapatıldı` })
      load()
    } catch (error) {
      errorToast(error, 'Oturumlar kapatılamadı.')
    }
  }

  const changeOwnPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({ title: 'Hata', description: 'Yeni şifreler eşleşmiyor.', variant: 'destructive' })
      return
    }
    try {
      const r = await api.auth.changePassword(currentPassword, newPassword) as { closed_sessions?: number }
      toast({ title: 'Şifre değiştirildi', description: `Diğer ${r.closed_sessions ?? 0} oturum kapatıldı.` })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      load()
    } catch (error) {
      errorToast(error, 'Şifre değiştirilemedi.')
    }
  }

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast({ title: 'Kopyalandı' })
    } catch {
      toast({ title: 'Kopyalanamadı', variant: 'destructive' })
    }
  }

  const accountById = Object.fromEntries(accounts.map((a) => [a.id, a]))

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-3 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-semibold">
              LexCloud Yönetim Paneli <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xs text-gray-500">Yönetici Kullanıcı No: <span className="font-mono">{account?.userNo}</span></div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Yenile
          </Button>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="mr-1 h-4 w-4" /> Çıkış
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 lg:p-8">
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
            <TabsTrigger value="audit">İşlem Geçmişi</TabsTrigger>
            <TabsTrigger value="account">Hesabım</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-gray-600">Yeni hesaplar daima standart hesap olarak açılır ve boş başlar.</p>
              <Button onClick={() => setNewUserOpen(true)}>
                <Plus className="mr-1 h-4 w-4" /> Yeni Kullanıcı Oluştur
              </Button>
            </div>

            {accounts.map((a) => {
              const open = !!expanded[a.id]
              return (
                <Card key={a.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button className="flex items-center gap-2 text-left" onClick={() => setExpanded((p) => ({ ...p, [a.id]: !open }))}>
                        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <div>
                          <div className="flex flex-wrap items-center gap-2 font-medium">
                            {accountName(a)}
                            <Badge variant={a.account_type === 'admin' ? 'default' : 'secondary'}>
                              {a.account_type === 'admin' ? 'Yönetici' : 'Standart'}
                            </Badge>
                            {a.temp_password === 'pending' && <Badge variant="outline">Geçici şifre – ilk giriş bekleniyor</Badge>}
                            {a.temp_password === 'expired' && <Badge variant="destructive">Geçici şifrenin süresi doldu</Badge>}
                          </div>
                          <div className="font-mono text-sm text-gray-600">Kullanıcı No: {a.user_no}</div>
                        </div>
                      </button>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 text-sm text-gray-700">
                          <MonitorSmartphone className="h-4 w-4" /> Aktif Cihaz Sayısı: <b>{a.active_device_count}</b>
                        </span>
                        {a.account_type !== 'admin' && (
                          <Button size="sm" variant="outline" onClick={() => resetPassword(a)}>
                            <KeyRound className="mr-1 h-4 w-4" /> Yeni Geçici Şifre
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => revokeAll(a)} disabled={a.active_session_count === 0}>
                          <XCircle className="mr-1 h-4 w-4" /> Tüm Oturumları Kapat
                        </Button>
                      </div>
                    </div>

                    {open && (
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="text-xs uppercase text-gray-500">
                            <tr>
                              <th className="py-2 pr-3">Tarayıcı / Cihaz</th>
                              <th className="py-2 pr-3">Giriş Zamanı</th>
                              <th className="py-2 pr-3">Son Etkinlik</th>
                              <th className="py-2 pr-3">Durum</th>
                              <th className="py-2" />
                            </tr>
                          </thead>
                          <tbody>
                            {a.sessions.length === 0 && (
                              <tr><td colSpan={5} className="py-3 text-gray-500">Oturum yok</td></tr>
                            )}
                            {a.sessions.map((s) => (
                              <tr key={s.id} className="border-t">
                                <td className="py-2 pr-3">{s.device}</td>
                                <td className="py-2 pr-3">{fmt(s.created_at)}</td>
                                <td className="py-2 pr-3">{fmt(s.last_seen_at)}</td>
                                <td className="py-2 pr-3">
                                  <Badge variant={s.status === 'active' ? 'default' : 'outline'}>{SESSION_STATUS[s.status] ?? s.status}</Badge>
                                </td>
                                <td className="py-2 text-right">
                                  {s.status === 'active' && (
                                    <Button size="sm" variant="ghost" onClick={() => revokeSession(s.id)}>Oturumu Kapat</Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>İşlem Geçmişi</CardTitle>
                <CardDescription>Yalnızca yönetici hesabı görebilir. Şifreler kaydedilmez.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-gray-500">
                    <tr>
                      <th className="py-2 pr-3">Zaman</th>
                      <th className="py-2 pr-3">İşlem</th>
                      <th className="py-2">Hesap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.map((e) => {
                      const target = e.target_account_id ? accountById[e.target_account_id] : undefined
                      const userNo = (e.details.user_no as string | undefined) ?? target?.user_no
                      return (
                        <tr key={e.id} className="border-t">
                          <td className="py-2 pr-3 whitespace-nowrap">{fmt(e.created_at)}</td>
                          <td className="py-2 pr-3">{AUDIT_ACTIONS[e.action] ?? e.action}</td>
                          <td className="py-2 font-mono">{userNo ?? '—'}</td>
                        </tr>
                      )
                    })}
                    {audit.length === 0 && <tr><td colSpan={3} className="py-3 text-gray-500">Kayıt yok</td></tr>}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Hesabım → Şifre Değiştir</CardTitle>
                <CardDescription>Şifre değişince diğer cihazlardaki oturumlarınız kapatılır.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={changeOwnPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-current-password">Mevcut Şifre</Label>
                    <Input id="admin-current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-new-password">Yeni Şifre</Label>
                    <Input id="admin-new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    <p className="text-xs text-gray-500">En az 8 karakter; en az bir harf ve bir rakam.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-confirm-password">Yeni Şifre (Tekrar)</Label>
                    <Input id="admin-confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                  <Button type="submit">Şifreyi Değiştir</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
            <DialogDescription>Sunucu benzersiz bir Kullanıcı No ve süreli geçici şifre üretir. Hesap standart olarak açılır ve mevcut dosyalara erişemez.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-user-label">Not (isteğe bağlı, kimin için olduğunu hatırlamanız için)</Label>
            <Input id="new-user-label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} maxLength={100} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewUserOpen(false)}>Vazgeç</Button>
            <Button onClick={createUser} disabled={busy}>{busy ? 'Oluşturuluyor...' : 'Oluştur'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!issued} onOpenChange={(o) => { if (!o) setIssued(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{issued?.title}</DialogTitle>
            <DialogDescription>
              Geçici şifre yalnızca şimdi gösterilir; pencere kapanınca tekrar görüntülenemez. Kullanıcı ilk girişte kendi şifresini belirler.
            </DialogDescription>
          </DialogHeader>
          {issued && (
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500">Kullanıcı No</div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg">{issued.user_no}</span>
                  <Button size="sm" variant="ghost" onClick={() => copy(issued.user_no)}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Geçici Şifre</div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg">{issued.temp_password}</span>
                  <Button size="sm" variant="ghost" onClick={() => copy(issued.temp_password)}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="text-xs text-gray-500">Geçerlilik sonu: {fmt(issued.temp_password_expires_at)}</div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIssued(null)}>Kaydettim, Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
