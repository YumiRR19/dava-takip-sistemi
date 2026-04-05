export type Lang = 'tr' | 'en' | 'zh' | 'es'

export const langLabels: Record<Lang, string> = {
  tr: 'Türkçe',
  en: 'English',
  zh: '中文',
  es: 'Español',
}

export const langFlags: Record<Lang, string> = {
  tr: '🇹🇷',
  en: '🇬🇧',
  zh: '🇨🇳',
  es: '🇪🇸',
}

export interface Translations {
  // Nav & Login
  passwordPlaceholder: string
  loginButton: string
  loggingIn: string
  memberButton: string
  loginTitle: string
  loggingInMobile: string

  // Hero
  systemActive: string
  heroTitle1: string
  heroTitle2: string
  heroDescription: string

  // Features
  featureCaseTitle: string
  featureCaseDesc: string
  featureExecutionTitle: string
  featureExecutionDesc: string
  featureReminderTitle: string
  featureReminderDesc: string
  featureLetterTitle: string
  featureLetterDesc: string
  featureClientTitle: string
  featureClientDesc: string
  featureDashboardTitle: string
  featureDashboardDesc: string

  // Trust
  whyLexCloud: string
  trust1: string
  trust2: string
  trust3: string
  trust4: string

  // Footer
  footerText: string

  // Login error
  errorTitle: string
  errorWrongPassword: string

  // Membership modal
  membershipTitle: string
  membershipDescription: string
  fullNameLabel: string
  fullNamePlaceholder: string
  emailLabel: string
  emailPlaceholder: string
  phoneLabel: string
  phonePlaceholder: string
  officeLabel: string
  officePlaceholder: string
  noteLabel: string
  notePlaceholder: string
  submitButton: string
  submitting: string
  closeButton: string
  contactInfo: string
  successTitle: string
  successMessage: string

  // Email
  emailSubject: string
  emailBodyIntro: string
  emailFullName: string
  emailEmail: string
  emailPhone: string
  emailOffice: string
  emailNote: string
  emailFooter: string
}

export const translations: Record<Lang, Translations> = {
  tr: {
    passwordPlaceholder: 'Şifrenizi girin',
    loginButton: 'Giriş Yap',
    loggingIn: 'Giriş...',
    memberButton: 'Üye Ol',
    loginTitle: 'Giriş Yap',
    loggingInMobile: 'Giriş yapılıyor...',

    systemActive: 'Sistem Aktif — 7/24 Erişim',
    heroTitle1: 'Hukuk Ofislerinin',
    heroTitle2: 'Dijital Yönetim Platformu',
    heroDescription: 'LexCloud, hukuk ofisleri için geliştirilmiş kapsamlı bir bulut tabanlı yönetim platformudur. Dava dosyalarınızı, icra takiplerinizi, teminat mektuplarınızı ve müvekkillerinizi tek bir dijital ortamda güvenle yönetin. Otomatik hatırlatmalar, detaylı raporlar ve anlık durum takibi sayesinde hiçbir kritik süreyi kaçırmayın. Ofis verimliliğinizi artırın, zamandan tasarruf edin ve tüm hukuki süreçlerinizi profesyonelce organize edin.',

    featureCaseTitle: 'Dava Dosya Yönetimi',
    featureCaseDesc: 'Tüm dava dosyalarınızı dijital ortamda güvenle organize edin. Davacı, davalı, dosya numarası ve duruşma tarihlerini kolayca takip edin. Dosyalarınızı filtreleyerek anında erişim sağlayın.',
    featureExecutionTitle: 'İcra Takipleri',
    featureExecutionDesc: 'İcra süreçlerinizi baştan sona dijital ortamda yönetin. Alacaklı-borçlu bilgilerini, haciz durumunu ve ödeme takibini tek ekrandan kontrol edin. Haciz hatırlatmaları ile hiçbir tarihi kaçırmayın.',
    featureReminderTitle: 'Akıllı Hatırlatmalar',
    featureReminderDesc: 'Duruşma tarihleri, haciz süreleri ve kritik son tarihler için otomatik hatırlatma sistemi. Tarih bazlı filtreleme ve sorumlu kişi atamaları ile ekibinizi organize edin.',
    featureLetterTitle: 'Teminat Mektupları',
    featureLetterDesc: 'Teminat mektuplarınızı güvenle kaydedin, vade tarihlerini takip edin ve süreç yönetimini dijitalleştirin. Tüm mektup detaylarına tek tıkla ulaşın.',
    featureClientTitle: 'Müvekkil Yönetimi',
    featureClientDesc: 'Müvekkil bilgilerini merkezi bir veritabanında saklayın. İletişim bilgileri, dosya geçmişi ve notları tek bir profilde görüntüleyin. Müvekkillerinize hızlı ve profesyonel hizmet sunun.',
    featureDashboardTitle: 'Dashboard & Raporlama',
    featureDashboardDesc: 'Anlık istatistikler, dosya durum özetleri ve filtrelenebilir gösterge paneli ile ofisinizin genel durumunu bir bakışta görün. Verimlilik raporları ile performansınızı ölçün.',

    whyLexCloud: 'Neden LexCloud?',
    trust1: 'Bulut tabanlı güvenli altyapı — verileriniz her zaman korumalı',
    trust2: 'Gerçek zamanlı bildirimler — hiçbir güncellemeyi kaçırmayın',
    trust3: 'Kolay ve hızlı kullanım — eğitim gerektirmez, anında başlayın',
    trust4: 'Profesyonel raporlama — detaylı analiz ve istatistikler',

    footerText: 'LexCloud — Hukuk Ofisi Yönetim Platformu',

    errorTitle: 'Hata',
    errorWrongPassword: 'Şifre yanlış. Lütfen tekrar deneyin.',

    membershipTitle: 'Üye Ol',
    membershipDescription: 'LexCloud sistemine üyelik talebinde bulunmak için aşağıdaki formu doldurun.',
    fullNameLabel: 'Ad Soyad',
    fullNamePlaceholder: 'Adınızı ve soyadınızı girin',
    emailLabel: 'E-posta Adresi',
    emailPlaceholder: 'ornek@mail.com',
    phoneLabel: 'Telefon Numarası',
    phonePlaceholder: '05XX XXX XX XX',
    officeLabel: 'Ofis / Büro Adı',
    officePlaceholder: 'Hukuk büro veya ofis adınızı girin',
    noteLabel: 'Ek Not (İsteğe bağlı)',
    notePlaceholder: 'Eklemek istediğiniz bilgi varsa yazabilirsiniz...',
    submitButton: 'Üyelik Talebini Gönder',
    submitting: 'Gönderiliyor...',
    closeButton: 'Kapat',
    contactInfo: 'Sorularınız için:',
    successTitle: 'Talebiniz Alındı',
    successMessage: 'E-posta uygulamanız açılacaktır. Lütfen açılan e-postayı gönderin.<br />En kısa sürede sizinle iletişime geçilecektir.',

    emailSubject: 'LexCloud Üyelik Talebi',
    emailBodyIntro: 'Yeni üyelik talebi:',
    emailFullName: 'Ad Soyad',
    emailEmail: 'E-posta',
    emailPhone: 'Telefon',
    emailOffice: 'Ofis / Büro Adı',
    emailNote: 'Ek Not',
    emailFooter: 'Bu mesaj LexCloud üyelik formu üzerinden gönderilmiştir.',
  },

  en: {
    passwordPlaceholder: 'Enter your password',
    loginButton: 'Sign In',
    loggingIn: 'Signing in...',
    memberButton: 'Register',
    loginTitle: 'Sign In',
    loggingInMobile: 'Signing in...',

    systemActive: 'System Active — 24/7 Access',
    heroTitle1: 'The Digital Management',
    heroTitle2: 'Platform for Law Firms',
    heroDescription: 'LexCloud is a comprehensive cloud-based management platform designed specifically for law firms. Securely manage your case files, enforcement proceedings, guarantee letters, and clients all in one digital environment. With automated reminders, detailed reports, and real-time status tracking, you\'ll never miss a critical deadline. Boost your office productivity, save time, and professionally organize all your legal processes.',

    featureCaseTitle: 'Case File Management',
    featureCaseDesc: 'Securely organize all your case files in a digital environment. Easily track plaintiffs, defendants, file numbers, and hearing dates. Filter your files for instant access to any case.',
    featureExecutionTitle: 'Enforcement Proceedings',
    featureExecutionDesc: 'Manage your enforcement processes from start to finish digitally. Monitor creditor-debtor information, seizure status, and payment tracking from a single screen. Never miss a date with seizure reminders.',
    featureReminderTitle: 'Smart Reminders',
    featureReminderDesc: 'Automatic reminder system for hearing dates, seizure deadlines, and critical due dates. Organize your team with date-based filtering and responsible person assignments.',
    featureLetterTitle: 'Guarantee Letters',
    featureLetterDesc: 'Securely record your guarantee letters, track maturity dates, and digitize process management. Access all letter details with a single click.',
    featureClientTitle: 'Client Management',
    featureClientDesc: 'Store client information in a centralized database. View contact details, file history, and notes in a single profile. Provide fast and professional service to your clients.',
    featureDashboardTitle: 'Dashboard & Reporting',
    featureDashboardDesc: 'See your office\'s overall status at a glance with real-time statistics, file status summaries, and a filterable dashboard panel. Measure your performance with productivity reports.',

    whyLexCloud: 'Why LexCloud?',
    trust1: 'Cloud-based secure infrastructure — your data is always protected',
    trust2: 'Real-time notifications — never miss an update',
    trust3: 'Easy and fast to use — no training required, start instantly',
    trust4: 'Professional reporting — detailed analytics and statistics',

    footerText: 'LexCloud — Law Firm Management Platform',

    errorTitle: 'Error',
    errorWrongPassword: 'Incorrect password. Please try again.',

    membershipTitle: 'Register',
    membershipDescription: 'Fill out the form below to request membership to the LexCloud system.',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    emailLabel: 'Email Address',
    emailPlaceholder: 'example@mail.com',
    phoneLabel: 'Phone Number',
    phonePlaceholder: '+1 XXX XXX XXXX',
    officeLabel: 'Office / Firm Name',
    officePlaceholder: 'Enter your law office or firm name',
    noteLabel: 'Additional Note (Optional)',
    notePlaceholder: 'Add any additional information you\'d like to share...',
    submitButton: 'Submit Membership Request',
    submitting: 'Submitting...',
    closeButton: 'Close',
    contactInfo: 'For inquiries:',
    successTitle: 'Request Received',
    successMessage: 'Your email application will open. Please send the pre-filled email.<br />We will contact you as soon as possible.',

    emailSubject: 'LexCloud Membership Request',
    emailBodyIntro: 'New membership request:',
    emailFullName: 'Full Name',
    emailEmail: 'Email',
    emailPhone: 'Phone',
    emailOffice: 'Office / Firm Name',
    emailNote: 'Additional Note',
    emailFooter: 'This message was sent via the LexCloud membership form.',
  },

  zh: {
    passwordPlaceholder: '请输入密码',
    loginButton: '登录',
    loggingIn: '登录中...',
    memberButton: '注册',
    loginTitle: '登录',
    loggingInMobile: '正在登录...',

    systemActive: '系统运行中 — 全天候访问',
    heroTitle1: '律师事务所的',
    heroTitle2: '数字化管理平台',
    heroDescription: 'LexCloud 是专为律师事务所打造的综合性云端管理平台。在一个安全的数字化环境中管理您的案件档案、执行程序、担保函和客户信息。通过自动提醒、详细报告和实时状态追踪，确保您不会错过任何关键截止日期。提升办公效率，节省时间，以专业方式组织所有法律流程。',

    featureCaseTitle: '案件档案管理',
    featureCaseDesc: '在数字化环境中安全地整理所有案件档案。轻松追踪原告、被告、档案编号和开庭日期。通过筛选功能即时访问任何案件。',
    featureExecutionTitle: '执行程序追踪',
    featureExecutionDesc: '从头到尾以数字化方式管理执行程序。在单一界面中监控债权人与债务人信息、查封状态和还款追踪。通过查封提醒确保不遗漏任何日期。',
    featureReminderTitle: '智能提醒系统',
    featureReminderDesc: '针对开庭日期、查封期限和关键截止日期的自动提醒系统。通过日期筛选和负责人分配功能组织您的团队。',
    featureLetterTitle: '担保函管理',
    featureLetterDesc: '安全记录担保函、追踪到期日并将流程管理数字化。一键访问所有函件详情。',
    featureClientTitle: '客户管理',
    featureClientDesc: '在集中式数据库中存储客户信息。在单一个人资料中查看联系方式、档案历史和备注。为客户提供快速、专业的服务。',
    featureDashboardTitle: '仪表板与报告',
    featureDashboardDesc: '通过实时统计数据、档案状态摘要和可筛选的仪表板面板一目了然地了解事务所的整体状况。通过效率报告衡量绩效。',

    whyLexCloud: '为什么选择 LexCloud？',
    trust1: '基于云端的安全基础设施 — 数据始终受到保护',
    trust2: '实时通知 — 不错过任何更新',
    trust3: '简单快速易上手 — 无需培训，即刻开始',
    trust4: '专业报告系统 — 详细分析与统计数据',

    footerText: 'LexCloud — 律师事务所管理平台',

    errorTitle: '错误',
    errorWrongPassword: '密码错误，请重试。',

    membershipTitle: '注册',
    membershipDescription: '请填写以下表格以申请加入 LexCloud 系统。',
    fullNameLabel: '姓名',
    fullNamePlaceholder: '请输入您的全名',
    emailLabel: '电子邮箱',
    emailPlaceholder: 'example@mail.com',
    phoneLabel: '电话号码',
    phonePlaceholder: '+86 XXX XXXX XXXX',
    officeLabel: '事务所名称',
    officePlaceholder: '请输入您的律师事务所名称',
    noteLabel: '附加说明（可选）',
    notePlaceholder: '如有其他需要说明的信息，请在此填写...',
    submitButton: '提交会员申请',
    submitting: '提交中...',
    closeButton: '关闭',
    contactInfo: '如有疑问：',
    successTitle: '申请已收到',
    successMessage: '您的电子邮件应用将打开，请发送预填的邮件。<br />我们将尽快与您联系。',

    emailSubject: 'LexCloud 会员申请',
    emailBodyIntro: '新会员申请：',
    emailFullName: '姓名',
    emailEmail: '电子邮箱',
    emailPhone: '电话',
    emailOffice: '事务所名称',
    emailNote: '附加说明',
    emailFooter: '此消息通过 LexCloud 会员表单发送。',
  },

  es: {
    passwordPlaceholder: 'Ingrese su contraseña',
    loginButton: 'Iniciar Sesión',
    loggingIn: 'Iniciando...',
    memberButton: 'Registrarse',
    loginTitle: 'Iniciar Sesión',
    loggingInMobile: 'Iniciando sesión...',

    systemActive: 'Sistema Activo — Acceso 24/7',
    heroTitle1: 'La Plataforma de Gestión',
    heroTitle2: 'Digital para Bufetes de Abogados',
    heroDescription: 'LexCloud es una plataforma integral de gestión en la nube diseñada específicamente para bufetes de abogados. Administre de forma segura sus expedientes judiciales, procedimientos de ejecución, cartas de garantía y clientes en un solo entorno digital. Con recordatorios automáticos, informes detallados y seguimiento en tiempo real, nunca perderá un plazo crítico. Aumente la productividad de su oficina, ahorre tiempo y organice profesionalmente todos sus procesos legales.',

    featureCaseTitle: 'Gestión de Expedientes',
    featureCaseDesc: 'Organice de forma segura todos sus expedientes judiciales en un entorno digital. Realice un seguimiento fácil de demandantes, demandados, números de expediente y fechas de audiencia. Filtre sus archivos para acceder al instante a cualquier caso.',
    featureExecutionTitle: 'Procedimientos de Ejecución',
    featureExecutionDesc: 'Gestione sus procesos de ejecución de principio a fin de forma digital. Controle la información de acreedores y deudores, el estado de embargos y el seguimiento de pagos desde una sola pantalla. Nunca pierda una fecha con los recordatorios de embargo.',
    featureReminderTitle: 'Recordatorios Inteligentes',
    featureReminderDesc: 'Sistema de recordatorios automáticos para fechas de audiencia, plazos de embargo y fechas límite críticas. Organice su equipo con filtrado por fecha y asignaciones de personas responsables.',
    featureLetterTitle: 'Cartas de Garantía',
    featureLetterDesc: 'Registre de forma segura sus cartas de garantía, controle las fechas de vencimiento y digitalice la gestión de procesos. Acceda a todos los detalles de las cartas con un solo clic.',
    featureClientTitle: 'Gestión de Clientes',
    featureClientDesc: 'Almacene la información de clientes en una base de datos centralizada. Vea datos de contacto, historial de expedientes y notas en un solo perfil. Ofrezca un servicio rápido y profesional a sus clientes.',
    featureDashboardTitle: 'Panel de Control e Informes',
    featureDashboardDesc: 'Vea el estado general de su oficina de un vistazo con estadísticas en tiempo real, resúmenes de estado de expedientes y un panel filtrable. Mida su rendimiento con informes de productividad.',

    whyLexCloud: '¿Por qué LexCloud?',
    trust1: 'Infraestructura segura en la nube — sus datos siempre protegidos',
    trust2: 'Notificaciones en tiempo real — no pierda ninguna actualización',
    trust3: 'Fácil y rápido de usar — sin necesidad de capacitación, comience al instante',
    trust4: 'Informes profesionales — análisis detallados y estadísticas',

    footerText: 'LexCloud — Plataforma de Gestión para Bufetes de Abogados',

    errorTitle: 'Error',
    errorWrongPassword: 'Contraseña incorrecta. Por favor, inténtelo de nuevo.',

    membershipTitle: 'Registrarse',
    membershipDescription: 'Complete el formulario a continuación para solicitar la membresía en el sistema LexCloud.',
    fullNameLabel: 'Nombre Completo',
    fullNamePlaceholder: 'Ingrese su nombre completo',
    emailLabel: 'Correo Electrónico',
    emailPlaceholder: 'ejemplo@correo.com',
    phoneLabel: 'Número de Teléfono',
    phonePlaceholder: '+34 XXX XXX XXX',
    officeLabel: 'Nombre del Bufete',
    officePlaceholder: 'Ingrese el nombre de su bufete de abogados',
    noteLabel: 'Nota Adicional (Opcional)',
    notePlaceholder: 'Agregue cualquier información adicional que desee compartir...',
    submitButton: 'Enviar Solicitud de Membresía',
    submitting: 'Enviando...',
    closeButton: 'Cerrar',
    contactInfo: 'Para consultas:',
    successTitle: 'Solicitud Recibida',
    successMessage: 'Su aplicación de correo se abrirá. Por favor, envíe el correo prellenado.<br />Nos pondremos en contacto con usted lo antes posible.',

    emailSubject: 'Solicitud de Membresía LexCloud',
    emailBodyIntro: 'Nueva solicitud de membresía:',
    emailFullName: 'Nombre Completo',
    emailEmail: 'Correo Electrónico',
    emailPhone: 'Teléfono',
    emailOffice: 'Nombre del Bufete',
    emailNote: 'Nota Adicional',
    emailFooter: 'Este mensaje fue enviado a través del formulario de membresía de LexCloud.',
  },
}
