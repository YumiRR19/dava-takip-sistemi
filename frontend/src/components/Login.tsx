import React, { useState } from 'react'
import { Eye, EyeOff, Shield, FileText, Bell, Users, Scale, BarChart3, Lock, Mail, X, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const { login, loading } = useAuth()
  const { toast } = useToast()

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
            Kayıt Ol
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
                  Kayıt Ol
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

      {/* Register / Contact Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
            {/* Close button */}
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Kayıt Ol</h2>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  LexCloud sistemine kayıt olmak için lütfen bizimle iletişime geçin. 
                  Aşağıdaki e-posta adresine mesaj göndererek kayıt talebinizi iletebilirsiniz.
                </p>
              </div>

              {/* Email Info */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
                <Label className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-2 block">
                  İletişim E-posta Adresi
                </Label>
                <a 
                  href="mailto:ysfmrzgndz2004@gmail.com?subject=LexCloud%20Kay%C4%B1t%20Talebi&body=Merhaba%2C%0A%0ALexCloud%20sisteminize%20kay%C4%B1t%20olmak%20istiyorum.%0A%0AAd%C4%B1m%3A%0ATelefon%3A%0AOfis%20Ad%C4%B1%3A%0A%0ATe%C5%9Fekk%C3%BCrler."
                  className="text-lg font-semibold text-blue-700 hover:text-blue-800 transition-colors break-all"
                >
                  ysfmrzgndz2004@gmail.com
                </a>
              </div>

              {/* Steps */}
              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-gray-700">Kayıt Süreci:</p>
                <div className="space-y-2">
                  {[
                    'Yukarıdaki e-posta adresine kayıt talebinizi gönderin',
                    'Bilgileriniz incelendikten sonra sizinle iletişime geçilecektir',
                    'Hesabınız oluşturulduktan sonra giriş yapabilirsiniz',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-600">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href="mailto:ysfmrzgndz2004@gmail.com?subject=LexCloud%20Kay%C4%B1t%20Talebi&body=Merhaba%2C%0A%0ALexCloud%20sisteminize%20kay%C4%B1t%20olmak%20istiyorum.%0A%0AAd%C4%B1m%3A%0ATelefon%3A%0AOfis%20Ad%C4%B1%3A%0A%0ATe%C5%9Fekk%C3%BCrler."
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
                >
                  <Mail className="h-4 w-4" />
                  E-posta Gönder
                </a>
                <Button
                  variant="outline"
                  onClick={() => setShowRegisterModal(false)}
                  className="w-full"
                >
                  Kapat
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
