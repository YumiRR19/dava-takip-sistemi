import React, { useState, useRef, useEffect } from 'react'
import { Eye, EyeOff, Shield, FileText, Bell, Users, Scale, BarChart3, Lock, Mail, X, CheckCircle2, User, Phone, Building2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    officeName: '',
    message: '',
  })
  const [registerSubmitting, setRegisterSubmitting] = useState(false)
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { login, loading } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const clearModalTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const success = await login(password)
    if (!success) {
      toast({
        title: "Hata",
        description: "Şifre yanlış. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
      setPassword('')
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterSubmitting(true)

    try {
      const subject = encodeURIComponent('LexCloud Üyelik Talebi')
      const body = encodeURIComponent(
        `Yeni üyelik talebi:\n\n` +
        `Ad Soyad: ${registerForm.fullName}\n` +
        `E-posta: ${registerForm.email}\n` +
        `Telefon: ${registerForm.phone}\n` +
        `Ofis / Büro Adı: ${registerForm.officeName}\n` +
        `${registerForm.message ? `Ek Not: ${registerForm.message}\n` : ''}` +
        `\n---\nBu mesaj LexCloud üyelik formu üzerinden gönderilmiştir.`
      )
      
      window.location.href = `mailto:yusuf@lexcloud.tr?subject=${subject}&body=${body}`
      
      setRegisterSuccess(true)
      timeoutRef.current = setTimeout(() => {
        setRegisterSuccess(false)
        setShowRegisterModal(false)
        setRegisterForm({ fullName: '', email: '', phone: '', officeName: '', message: '' })
        timeoutRef.current = null
      }, 4000)
    } catch {
      toast({
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setRegisterSubmitting(false)
    }
  }

  const features = [
    {
      icon: FileText,
      title: 'Dava Dosya Yönetimi',
      description: 'Tüm dava dosyalarınızı dijital ortamda organize edin, takip edin ve yönetin.'
    },
    {
      icon: Scale,
      title: 'İcra Takipleri',
      description: 'İcra süreçlerinizi baştan sona takip edin, haciz hatırlatmaları alın.'
    },
    {
      icon: Bell,
      title: 'Akıllı Hatırlatmalar',
      description: 'Önemli duruşma tarihleri ve süreleri için otomatik hatırlatma sistemi.'
    },
    {
      icon: Shield,
      title: 'Teminat Mektupları',
      description: 'Teminat mektuplarınızı güvenle saklayın ve süreçlerini takip edin.'
    },
    {
      icon: Users,
      title: 'Müvekkil Yönetimi',
      description: 'Müvekkil bilgilerini merkezi bir sistemde tutun, kolay erişim sağlayın.'
    },
    {
      icon: BarChart3,
      title: 'Dashboard & Raporlama',
      description: 'Anlık istatistikler, durum özetleri ve filtrelenebilir gösterge paneli.'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12 lg:py-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">LexCloud</span>
        </div>

        {/* Login Panel - Top Right (Desktop) */}
        <div className="hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3">
          <Lock className="h-4 w-4 text-blue-300 flex-shrink-0" />
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
                required
                className="w-48 h-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-8 text-sm focus:bg-white/20 focus:border-blue-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <Button 
              type="submit" 
              size="sm"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium"
            >
              {loading ? 'Giriş...' : 'Giriş Yap'}
            </Button>
          </form>
          <div className="w-px h-6 bg-white/20" />
          <button
            onClick={() => setShowRegisterModal(true)}
            className="text-blue-300 hover:text-blue-200 text-sm font-medium whitespace-nowrap transition-colors"
          >
            Üye Ol
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 px-6 lg:px-12">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto pt-8 lg:pt-16 pb-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-blue-200 text-sm font-medium">Sistem Aktif — 7/24 Erişim</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Hukuk Ofislerinin
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Dijital Yönetim Platformu
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Dava dosyalarınızı, icra takiplerinizi, teminat mektuplarınızı ve müvekkillerinizi 
              tek bir platform üzerinden güvenle yönetin. Hatırlatmalar, raporlar ve anlık 
              durum takibi ile hiçbir süreyi kaçırmayın.
            </p>
          </div>

          {/* Mobile Login Panel */}
          <div className="md:hidden mb-12">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5 text-blue-300" />
                <h3 className="text-white font-semibold">Giriş Yap</h3>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifrenizi girin"
                    required
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10 focus:bg-white/20 focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </Button>
              </form>
              <div className="mt-3 pt-3 border-t border-white/10 text-center">
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors"
                >
                  Üye Ol
                </button>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-blue-400/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                  <feature.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-white text-center mb-6">Neden LexCloud?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  'Bulut tabanlı güvenli altyapı',
                  'Gerçek zamanlı bildirimler',
                  'Kolay ve hızlı kullanım',
                  'Profesyonel raporlama',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pb-8">
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} LexCloud — Hukuk Ofisi Yönetim Platformu
            </p>
          </div>
        </div>
      </div>

      {/* Membership Form Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => {
                clearModalTimeout()
                setShowRegisterModal(false)
                setRegisterSuccess(false)
                setRegisterForm({ fullName: '', email: '', phone: '', officeName: '', message: '' })
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8">
              {registerSuccess ? (
                /* Success state */
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Talebiniz Alındı</h2>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Üyelik talebiniz başarıyla iletildi. E-posta uygulamanız açılacaktır.<br />
                    En kısa sürede sizinle iletişime geçilecektir.
                  </p>
                </div>
              ) : (
                /* Form state */
                <>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-7 w-7 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Üye Ol</h2>
                    <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                      LexCloud sistemine üyelik talebinde bulunmak için aşağıdaki formu doldurun.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        Ad Soyad <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="reg-name"
                        type="text"
                        value={registerForm.fullName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Adınızı ve soyadınızı girin"
                        required
                        className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        E-posta Adresi <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="reg-email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="ornek@mail.com"
                        required
                        className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        Telefon Numarası <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="reg-phone"
                        type="tel"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="05XX XXX XX XX"
                        required
                        className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-office" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        Ofis / Büro Adı <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="reg-office"
                        type="text"
                        value={registerForm.officeName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, officeName: e.target.value }))}
                        placeholder="Hukuk büro veya ofis adınızı girin"
                        required
                        className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-message" className="text-sm font-medium text-gray-700">
                        Ek Not (İsteğe bağlı)
                      </Label>
                      <textarea
                        id="reg-message"
                        value={registerForm.message}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Eklemek istediğiniz bilgi varsa yazabilirsiniz..."
                        rows={3}
                        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:ring-blue-400 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="pt-2 space-y-3">
                      <Button
                        type="submit"
                        disabled={registerSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
                      >
                        {registerSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Gönderiliyor...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Send className="h-4 w-4" />
                            Üyelik Talebini Gönder
                          </span>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          clearModalTimeout()
                          setShowRegisterModal(false)
                          setRegisterForm({ fullName: '', email: '', phone: '', officeName: '', message: '' })
                        }}
                        className="w-full"
                      >
                        Kapat
                      </Button>
                    </div>
                  </form>

                  {/* Contact info */}
                  <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">
                      Sorularınız için: <a href="mailto:yusuf@lexcloud.tr" className="text-blue-500 hover:text-blue-600 font-medium">yusuf@lexcloud.tr</a>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
