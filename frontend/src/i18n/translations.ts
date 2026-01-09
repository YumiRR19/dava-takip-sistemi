export type Language = 'tr' | 'en' | 'de'

export interface Translations {
  // Common
  common: {
    save: string
    cancel: string
    delete: string
    edit: string
    create: string
    update: string
    back: string
    search: string
    filter: string
    loading: string
    saving: string
    error: string
    success: string
    warning: string
    confirm: string
    yes: string
    no: string
    all: string
    none: string
    actions: string
    retry: string
    noResults: string
    noResultsFound: string
    errorOccurred: string
    required: string
  }
  
  // Navigation
  nav: {
    home: string
    cases: string
    executions: string
    compensationLetters: string
    clients: string
    settings: string
  }
  
  // Login
  login: {
    title: string
    subtitle: string
    password: string
    passwordPlaceholder: string
    loginButton: string
    loggingIn: string
    wrongPassword: string
  }
  
  // Dashboard
  dashboard: {
    title: string
    totalCases: string
    totalExecutions: string
    totalCompensationLetters: string
    totalClients: string
    noCasesYet: string
    noExecutionsYet: string
    noCompensationLettersYet: string
    noClientsYet: string
    reminders: string
    todayReminders: string
    noRemindersToday: string
    noRemindersForFilter: string
    startByAddingCasesAndClients: string
    newCase: string
    newClient: string
    apiActive: string
    apiError: string
    wsConnected: string
    wsPolling: string
    wsClosed: string
    dbActive: string
    dbError: string
    caseFiles: string
    executionFiles: string
    compensationLettersFilter: string
    fileNo: string
    caseName: string
    court: string
    client: string
    defendant: string
    reminder: string
    reminderText: string
    executionFileNo: string
    execution: string
    letterNo: string
    customer: string
    assignedBy: string
    responsiblePerson: string
  }
  
  // Cases
  cases: {
    title: string
    newCase: string
    editCase: string
    caseInfo: string
    editCaseInfo: string
    createNewCase: string
    updateExistingCase: string
    createNewCaseRecord: string
    searchPlaceholder: string
    statusFilter: string
    allStatuses: string
    responsiblePersonFilter: string
    allResponsiblePersons: string
    assignedByFilter: string
    allAssignedBy: string
    noCasesFound: string
    noCasesMatchingCriteria: string
    createFirstCase: string
    court: string
    fileNo: string
    client: string
    defendant: string
    caseName: string
    reminderDate: string
    reminderText: string
    actions: string
    confirmDelete: string
    caseDeleted: string
    caseDeleteError: string
    casesLoadError: string
    caseCreated: string
    caseUpdated: string
    caseCreateError: string
    caseUpdateError: string
    caseLoadError: string
    selectClient: string
    clientsLoading: string
    errorOccurred: string
    noClientFound: string
    noClientsYet: string
    addClient: string
    caseNamePlaceholder: string
    defendantPlaceholder: string
    courtPlaceholder: string
    caseNumberPlaceholder: string
    selectStatus: string
    selectCaseType: string
    openingDate: string
    hearingDate: string
    officeArchiveNo: string
    officeArchiveNoPlaceholder: string
    selectResponsiblePerson: string
    selectAssignedBy: string
    notes: string
    notesPlaceholder: string
    conflictError: string
    conflictErrorDescription: string
    waitForClientsLoading: string
    selectValidClient: string
  }
  
  // Case statuses
  caseStatuses: {
    acquittal: string
    penalty: string
    partialAcceptPartialReject: string
    accepted: string
    rejected: string
    appeal: string
    regionalAppeal: string
    pending: string
    finalization: string
    awaitingDecision: string
    expert: string
    concordat: string
  }
  
  // Case types
  caseTypes: {
    criminal: string
    civil: string
    execution: string
    administrative: string
    salesOffice: string
    mediation: string
    cbs: string
    compensationCommission: string
  }
  
  // Clients
  clients: {
    title: string
    newClient: string
    editClient: string
    clientInfo: string
    editClientInfo: string
    createNewClient: string
    updateExistingClient: string
    createNewClientRecord: string
    searchPlaceholder: string
    noClientsFound: string
    noClientsMatchingCriteria: string
    addFirstClient: string
    registration: string
    confirmDelete: string
    clientDeleted: string
    clientDeleteError: string
    clientDeleteErrorWithCases: string
    clientsLoadError: string
    clientCreated: string
    clientUpdated: string
    clientCreateError: string
    clientUpdateError: string
    clientLoadError: string
    name: string
    namePlaceholder: string
    vekaletInfo: string
    vekaletInfoPlaceholder: string
    phone: string
    phonePlaceholder: string
    vekaletOfficeNo: string
    vekaletOfficeNoPlaceholder: string
    taxId: string
    taxIdPlaceholder: string
    address: string
    addressPlaceholder: string
  }
  
  // Executions
  executions: {
    title: string
    newExecution: string
    editExecution: string
    executionInfo: string
    editExecutionInfo: string
    createNewExecution: string
    updateExistingExecution: string
    createNewExecutionRecord: string
    executionList: string
    viewAndManageExecutions: string
    searchPlaceholder: string
    statusFilter: string
    allStatuses: string
    executionTypeFilter: string
    allExecutionTypes: string
    seizureStatusFilter: string
    allSeizureStatuses: string
    responsiblePersonFilter: string
    allResponsiblePersons: string
    assignedByFilter: string
    allAssignedBy: string
    noExecutionsFound: string
    noExecutionsMatchingCriteria: string
    execution: string
    executionFileNo: string
    client: string
    defendant: string
    status: string
    seizureStatus: string
    openingDate: string
    reminder: string
    actions: string
    confirmDelete: string
    executionDeleted: string
    executionDeleteError: string
    executionsLoadError: string
    executionCreated: string
    executionUpdated: string
    executionCreateError: string
    executionUpdateError: string
    executionLoadError: string
    selectClient: string
    clientsLoading: string
    errorOccurred: string
    noClientFound: string
    noClientsYet: string
    addClient: string
    defendantPlaceholder: string
    executionOffice: string
    executionOfficePlaceholder: string
    executionNumberPlaceholder: string
    selectStatus: string
    selectExecutionType: string
    selectSeizureStatus: string
    officeArchiveNo: string
    officeArchiveNoPlaceholder: string
    reminderDate: string
    reminderTextLabel: string
    reminderTextPlaceholder: string
    selectResponsiblePerson: string
    selectAssignedBy: string
    notes: string
    notesPlaceholder: string
    timeoutError: string
    conflictError: string
    conflictErrorDescription: string
    waitForClientsLoading: string
    selectValidClient: string
    selectClientFromList: string
    noClientsFound: string
    noClientsAddedYet: string
    enterDefendantName: string
    selectOrTypeExecutionOffice: string
    searchOrTypeExecutionOffice: string
    enterExecutionNumber: string
    startDate: string
    enterOfficeArchiveNo: string
    reminderText: string
    enterReminderText: string
    privateNotes: string
    enterPrivateNotes: string
    clientsTimeoutError: string
    clientsLoadError: string
    pleaseWaitClientsLoading: string
    pleaseSelectClient: string
    selectedClientInvalid: string
    updateExistingExecutionInfo: string
  }
  
  // Execution statuses
  executionStatuses: {
    pending: string
    enforcement: string
    externalCollection: string
    objected: string
    executionPostponed: string
    sued: string
    paymentPromise: string
    expert: string
  }
  
  // Execution types
  executionTypes: {
    creditCardNoJudgment: string
    consumerLoanNoJudgment: string
    gksNoJudgment: string
    billOfExchange: string
    check: string
    checkNoJudgment: string
    pledgeSample8: string
    mortgageSample6: string
    mortgageSample9: string
    sample45: string
    invoiceNoJudgment: string
    alimonySample49: string
    precautionaryMeasure: string
    ordinaryRentSample13: string
    evictionSample14: string
  }
  
  // Seizure statuses
  seizureStatuses: {
    seizedVehicle: string
    pledgedVehicle: string
    wantedForSale: string
    mortgagedRealEstate: string
    seizedRealEstate: string
  }
  
  // Compensation Letters
  compensationLetters: {
    title: string
    newLetter: string
    editLetter: string
    letterInfo: string
    editLetterInfo: string
    createNewLetter: string
    searchPlaceholder: string
    statusFilter: string
    allStatuses: string
    responsiblePersonFilter: string
    allResponsiblePersons: string
    assignedByFilter: string
    allAssignedBy: string
    noLettersFound: string
    noLettersMatchingCriteria: string
    createFirstLetter: string
    letterNo: string
    bank: string
    customerNo: string
    customer: string
    court: string
    fileNo: string
    status: string
    actions: string
    confirmDelete: string
    letterDeleted: string
    letterDeleteError: string
    lettersLoadError: string
    letterCreated: string
    letterUpdated: string
    letterCreateError: string
    letterUpdateError: string
    letterLoadError: string
    selectClient: string
    clientsLoading: string
    errorOccurred: string
    noClientFound: string
    noClientsYet: string
    addClient: string
    selectBank: string
    reminderDate: string
    selectAssignedBy: string
    selectResponsiblePerson: string
    selectStatus: string
    descriptionText: string
    descriptionTextPlaceholder: string
    reminderTextLabel: string
    reminderTextPlaceholder: string
    conflictError: string
    conflictErrorDescription: string
    client: string
    noClientsFound: string
    noClientsAddedYet: string
    letterNumber: string
    customerNumber: string
    assignedBy: string
    responsiblePerson: string
    enterReminderText: string
    enterDescriptionText: string
  }
  
  // Compensation Letter statuses
  compensationLetterStatuses: {
    returned: string
    returnRequested: string
    ongoing: string
  }
  
  // Settings
  settings: {
    title: string
    logout: string
    changePassword: string
    changePasswordDescription: string
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
    savePassword: string
    passwordChanged: string
    passwordChangeError: string
    passwordMismatch: string
    passwordTooShort: string
    backupRestore: string
    backupRestoreDescription: string
    downloadBackup: string
    backupDownloaded: string
    backupError: string
    selectBackupFile: string
    restoreWarning: string
    dataRestored: string
    restoreError: string
    invalidBackupFormat: string
    invalidBackupSections: string
    serverError: string
    appearance: string
    appearanceDescription: string
    darkTheme: string
    enableDarkTheme: string
    themeChanged: string
    lightThemeEnabled: string
    darkThemeEnabled: string
    autoBackup: string
    autoBackupDescription: string
    autoBackupEnabled: string
    dailyAutoBackupActive: string
    lastBackup: string
    nextBackup: string
    language: string
    languageDescription: string
    selectLanguage: string
    languageChanged: string
  }
  
  // Languages
  languages: {
    turkish: string
    english: string
    german: string
  }
  
  // Responsible persons (these are names, kept as-is)
  responsiblePersons: {
    avMSerifBey: string
    omerBey: string
    avIbrahimBey: string
    avKenanBey: string
    ismailBey: string
    ebruHanim: string
    pinarHanim: string
    yarenHanim: string
  }
}

export const translations: Record<Language, Translations> = {
  tr: {
    common: {
      save: 'Kaydet',
      cancel: 'İptal',
      delete: 'Sil',
      edit: 'Düzenle',
      create: 'Oluştur',
      update: 'Güncelle',
      back: 'Geri',
      search: 'Ara',
      filter: 'Filtrele',
      loading: 'Yükleniyor...',
      saving: 'Kaydediliyor...',
      error: 'Hata',
      success: 'Başarılı',
      warning: 'Uyarı',
      confirm: 'Onayla',
      yes: 'Evet',
      no: 'Hayır',
      all: 'Tümü',
      none: 'Hiçbiri',
      actions: 'İşlemler',
      retry: 'Tekrar Dene',
      noResults: 'Sonuç bulunamadı.',
      noResultsFound: 'Sonuç bulunamadı.',
      errorOccurred: 'Bir hata oluştu.',
      required: '*'
    },
    nav: {
      home: 'Anasayfa',
      cases: 'Dava Dosyaları',
      executions: 'İcra Takipleri',
      compensationLetters: 'Teminat Mektupları',
      clients: 'Müvekkiller',
      settings: 'Ayarlar'
    },
    login: {
      title: 'LexCloud',
      subtitle: 'Dava takip sistemine giriş yapın',
      password: 'Şifre',
      passwordPlaceholder: 'Şifrenizi girin',
      loginButton: 'Giriş Yap',
      loggingIn: 'Giriş yapılıyor...',
      wrongPassword: 'Şifre yanlış. Lütfen tekrar deneyin.'
    },
    dashboard: {
      title: 'Anasayfa',
      totalCases: 'Toplam Dava',
      totalExecutions: 'Toplam İcra Takipleri',
      totalCompensationLetters: 'Toplam Teminat Mektupları',
      totalClients: 'Toplam Müvekkil',
      noCasesYet: 'Henüz dava eklenmemiş',
      noExecutionsYet: 'Henüz icra eklenmemiş',
      noCompensationLettersYet: 'Henüz teminat mektubu eklenmemiş',
      noClientsYet: 'Henüz müvekkil eklenmemiş',
      reminders: 'Hatırlatmalar',
      todayReminders: 'Bugün için hatırlatmalar',
      noRemindersToday: 'Bugün için hatırlatma bulunmuyor.',
      noRemindersForFilter: 'için bugün hatırlatma bulunmuyor.',
      startByAddingCasesAndClients: 'Dava ve müvekkil ekleyerek başlayın.',
      newCase: 'Yeni Dava',
      newClient: 'Yeni Müvekkil',
      apiActive: 'Aktif',
      apiError: 'Hata',
      wsConnected: 'Bağlı',
      wsPolling: 'Polling',
      wsClosed: 'Kapalı',
      dbActive: 'Aktif',
      dbError: 'Hata',
      caseFiles: 'Dava Dosyaları',
      executionFiles: 'İcra Takipleri',
      compensationLettersFilter: 'Teminat Mektupları',
      fileNo: 'Dosya No',
      caseName: 'Dava Adı',
      court: 'Mahkeme',
      client: 'Müvekkil',
      defendant: 'Karşı Taraf',
      reminder: 'Hatırlatma',
      reminderText: 'Hatırlatma Metni',
      executionFileNo: 'İcra Dosya No',
      execution: 'İcra',
      letterNo: 'Mektup No',
      customer: 'Müşteri',
      assignedBy: 'Görevlendiren',
      responsiblePerson: 'İlgili/Sorumlu'
    },
    cases: {
      title: 'Dava Dosyaları',
      newCase: 'Yeni Dava',
      editCase: 'Dava Düzenle',
      caseInfo: 'Yeni Dava Oluştur',
      editCaseInfo: 'Dava Bilgilerini Düzenle',
      createNewCase: 'Yeni bir dava kaydı oluşturun.',
      updateExistingCase: 'Mevcut dava bilgilerini güncelleyin.',
      createNewCaseRecord: 'Yeni bir dava kaydı oluşturun.',
      searchPlaceholder: 'Dava başlığı, müvekkil adı, dava numarası, dava adı veya karşı taraf ile ara...',
      statusFilter: 'Durum filtrele',
      allStatuses: 'Tüm Durumlar',
      responsiblePersonFilter: 'İlgili/Sorumlu Filtrele',
      allResponsiblePersons: 'Tüm Sorumlu Kişiler',
      assignedByFilter: 'Görevlendiren Filtrele',
      allAssignedBy: 'Tüm Görevlendirenler',
      noCasesFound: 'Henüz dava bulunmuyor.',
      noCasesMatchingCriteria: 'Arama kriterlerinize uygun dava bulunamadı.',
      createFirstCase: 'İlk Davayı Oluştur',
      court: 'Mahkeme',
      fileNo: 'Dosya No',
      client: 'Müvekkil',
      defendant: 'Karşı Taraf',
      caseName: 'Dava Adı',
      reminderDate: 'Hatırlatma Tarihi',
      reminderText: 'Hatırlatma Metni',
      actions: 'İşlemler',
      confirmDelete: 'Bu davayı silmek istediğinizden emin misiniz?',
      caseDeleted: 'Dava başarıyla silindi.',
      caseDeleteError: 'Dava silinirken bir hata oluştu.',
      casesLoadError: 'Dava Dosyaları yüklenirken bir hata oluştu.',
      caseCreated: 'Dava başarıyla oluşturuldu.',
      caseUpdated: 'Dava başarıyla güncellendi.',
      caseCreateError: 'Dava oluşturulurken bir hata oluştu.',
      caseUpdateError: 'Dava güncellenirken bir hata oluştu.',
      caseLoadError: 'Dava bilgileri yüklenirken bir hata oluştu.',
      selectClient: 'Müvekkil seçin',
      clientsLoading: 'Müvekkiller yükleniyor...',
      errorOccurred: 'Hata oluştu',
      noClientFound: 'Müvekkil bulunamadı',
      noClientsYet: 'Henüz müvekkil eklenmemiş',
      addClient: 'Müvekkil Ekle',
      caseNamePlaceholder: 'Dava adını girin',
      defendantPlaceholder: 'Karşı taraf adını girin',
      courtPlaceholder: 'Mahkeme adını manuel olarak girin',
      caseNumberPlaceholder: 'Dava numarasını girin',
      selectStatus: 'Durum seçin',
      selectCaseType: 'Dava türü seçin',
      openingDate: 'Açılış Tarihi',
      hearingDate: 'Duruşma Tarihi',
      officeArchiveNo: 'Ofis Arşiv No',
      officeArchiveNoPlaceholder: 'Ofis arşiv numarasını girin',
      selectResponsiblePerson: 'İlgili/Sorumlu seçin',
      selectAssignedBy: 'Görevlendiren seçin',
      notes: 'Notlar',
      notesPlaceholder: 'Notlarınızı girin',
      conflictError: 'Çakışma Hatası',
      conflictErrorDescription: 'Bu kayıt başka bir kullanıcı tarafından değiştirilmiş. Lütfen sayfayı yenileyin ve tekrar deneyin.',
      waitForClientsLoading: 'Müvekkiller yüklenirken lütfen bekleyin.',
      selectValidClient: 'Geçerli bir müvekkil seçiniz.'
    },
    caseStatuses: {
      acquittal: 'Beraat',
      penalty: 'Ceza',
      partialAcceptPartialReject: 'Kısmen Kabul Kısmen Red',
      accepted: 'Kabul',
      rejected: 'Red',
      appeal: 'Temyiz',
      regionalAppeal: 'İstinaf',
      pending: 'Derdest',
      finalization: 'Kesinleştirme',
      awaitingDecision: 'Gerekli Karar Bekleniyor',
      expert: 'Bilirkişi',
      concordat: 'Konkordato'
    },
    caseTypes: {
      criminal: 'Ceza',
      civil: 'Hukuk',
      execution: 'İcra',
      administrative: 'İdari Yargı',
      salesOffice: 'Satış Memurluğu',
      mediation: 'Arabuluculuk',
      cbs: 'Cbs',
      compensationCommission: 'Tazminat Komisyonu Başkanlığı'
    },
    clients: {
      title: 'Müvekkiller',
      newClient: 'Yeni Müvekkil',
      editClient: 'Müvekkil Düzenle',
      clientInfo: 'Yeni Müvekkil Oluştur',
      editClientInfo: 'Müvekkil Bilgilerini Düzenle',
      createNewClient: 'Yeni bir müvekkil kaydı oluşturun.',
      updateExistingClient: 'Mevcut müvekkil bilgilerini güncelleyin.',
      createNewClientRecord: 'Yeni bir müvekkil kaydı oluşturun.',
      searchPlaceholder: 'Ad, email, telefon veya vekalet ofis no ile ara...',
      noClientsFound: 'Henüz müvekkil bulunmuyor.',
      noClientsMatchingCriteria: 'Arama kriterlerinize uygun müvekkil bulunamadı.',
      addFirstClient: 'İlk Müvekkili Ekle',
      registration: 'Kayıt',
      confirmDelete: 'Bu müvekkili silmek istediğinizden emin misiniz?',
      clientDeleted: 'Müvekkil başarıyla silindi.',
      clientDeleteError: 'Müvekkil silinirken bir hata oluştu.',
      clientDeleteErrorWithCases: 'Bu müvekkile ait dava dosyaları bulunduğu için silinemez.',
      clientsLoadError: 'Müvekkiller yüklenirken bir hata oluştu.',
      clientCreated: 'Müvekkil başarıyla oluşturuldu.',
      clientUpdated: 'Müvekkil başarıyla güncellendi.',
      clientCreateError: 'Müvekkil oluşturulurken bir hata oluştu.',
      clientUpdateError: 'Müvekkil güncellenirken bir hata oluştu.',
      clientLoadError: 'Müvekkil bilgileri yüklenirken bir hata oluştu.',
      name: 'Ad Soyad',
      namePlaceholder: 'Müvekkil adını girin',
      vekaletInfo: 'Vekalet Bilgileri',
      vekaletInfoPlaceholder: 'Vekalet bilgilerini girin',
      phone: 'Telefon',
      phonePlaceholder: 'Telefon numarasını girin',
      vekaletOfficeNo: 'Vekalet Ofis No',
      vekaletOfficeNoPlaceholder: 'Vekalet ofis numarası girin',
      taxId: 'Müvekkil T.C veya Vergi No',
      taxIdPlaceholder: 'T.C. Kimlik No veya Vergi No girin',
      address: 'Adres',
      addressPlaceholder: 'Müvekkil adresini girin'
    },
    executions: {
      title: 'İcra Takipleri',
      newExecution: 'Yeni İcra',
      editExecution: 'İcra Düzenle',
      executionInfo: 'Yeni İcra Oluştur',
      editExecutionInfo: 'İcra Bilgilerini Düzenle',
      createNewExecution: 'Yeni bir icra kaydı oluşturun.',
      updateExistingExecution: 'Mevcut icra bilgilerini güncelleyin.',
      createNewExecutionRecord: 'Yeni bir icra kaydı oluşturun.',
      executionList: 'İcra Listesi',
      viewAndManageExecutions: 'Tüm icra kayıtlarınızı görüntüleyin ve yönetin.',
      searchPlaceholder: 'Müvekkil, karşı taraf veya icra dosya no ile ara...',
      statusFilter: 'Durum filtrele',
      allStatuses: 'Tüm Durumlar',
      executionTypeFilter: 'İcra türü filtrele',
      allExecutionTypes: 'Tüm İcra Türleri',
      seizureStatusFilter: 'Haciz durumu filtrele',
      allSeizureStatuses: 'Tüm Haciz Durumları',
      responsiblePersonFilter: 'İlgili/Sorumlu Filtrele',
      allResponsiblePersons: 'Tüm Sorumlu Kişiler',
      assignedByFilter: 'Görevlendiren Filtrele',
      allAssignedBy: 'Tüm Görevlendirenler',
      noExecutionsFound: 'Henüz icra kaydı bulunmuyor.',
      noExecutionsMatchingCriteria: 'Filtreleme kriterlerinize uygun icra bulunamadı.',
      execution: 'İcra',
      executionFileNo: 'İcra Dosya No',
      client: 'Müvekkil',
      defendant: 'Karşı Taraf',
      status: 'Durum',
      seizureStatus: 'Haciz Durumu',
      openingDate: 'Açılış Tarihi',
      reminder: 'Hatırlatma',
      actions: 'İşlemler',
      confirmDelete: 'Bu icrayı silmek istediğinizden emin misiniz?',
      executionDeleted: 'İcra başarıyla silindi.',
      executionDeleteError: 'İcra silinirken bir hata oluştu.',
      executionsLoadError: 'İcra Takipleri yüklenirken bir hata oluştu.',
      executionCreated: 'İcra başarıyla oluşturuldu.',
      executionUpdated: 'İcra başarıyla güncellendi.',
      executionCreateError: 'İcra oluşturulurken bir hata oluştu.',
      executionUpdateError: 'İcra güncellenirken bir hata oluştu.',
      executionLoadError: 'İcra bilgileri yüklenirken bir hata oluştu.',
      selectClient: 'Müvekkil seçin',
      clientsLoading: 'Müvekkiller yükleniyor...',
      errorOccurred: 'Hata oluştu',
      noClientFound: 'Müvekkil bulunamadı',
      noClientsYet: 'Henüz müvekkil eklenmemiş',
      addClient: 'Müvekkil Ekle',
      defendantPlaceholder: 'Karşı taraf adını girin',
      executionOffice: 'İcra',
      executionOfficePlaceholder: 'İcra dairesi seçin veya yazın...',
      executionNumberPlaceholder: 'İcra numarasını girin',
      selectStatus: 'Durum seçin',
      selectExecutionType: 'İcra türü seçin',
      selectSeizureStatus: 'Haciz durumu seçin',
      officeArchiveNo: 'Ofis Arşiv No',
      officeArchiveNoPlaceholder: 'Ofis arşiv numarasını girin',
      reminderDate: 'Hatırlatma Tarihi',
      reminderTextLabel: 'Hatırlatma Metni',
      reminderTextPlaceholder: 'Hatırlatma metnini girin',
      selectResponsiblePerson: 'İlgili/Sorumlu seçin',
      selectAssignedBy: 'Görevlendiren seçin',
      notes: 'Notlar',
      notesPlaceholder: 'Notlarınızı girin',
      timeoutError: 'Müvekkiller yüklenirken zaman aşımı oluştu. Lütfen sayfayı yenileyin.',
      conflictError: 'Çakışma Hatası',
      conflictErrorDescription: 'Bu kayıt başka bir kullanıcı tarafından değiştirilmiş. Lütfen sayfayı yenileyin ve tekrar deneyin.',
      waitForClientsLoading: 'Müvekkiller yüklenirken lütfen bekleyin.',
      selectValidClient: 'Lütfen bir müvekkil seçiniz.',
      selectClientFromList: 'Seçilen müvekkil geçerli değil. Lütfen listeden bir müvekkil seçiniz.'
    },
    executionStatuses: {
      pending: 'Derdest',
      enforcement: 'İnfaz',
      externalCollection: 'Haricen Tahsil',
      objected: 'İtirazlı',
      executionPostponed: 'İcranın Geri Bırakılması',
      sued: 'Davalı',
      paymentPromise: 'Ödeme Sözü',
      expert: 'Bilirkişi'
    },
    executionTypes: {
      creditCardNoJudgment: 'İlamsız Kredi Kartı',
      consumerLoanNoJudgment: 'İlamsız İhtiyaç Kartı',
      gksNoJudgment: 'İlamsız GKS',
      billOfExchange: 'Kambiyo / Bono',
      check: 'Kambiyo / Çek',
      checkNoJudgment: 'İlamsız / Çek',
      pledgeSample8: 'Rehin – Örnek 8',
      mortgageSample6: 'İpotek – Örnek 6',
      mortgageSample9: 'İpotek – Örnek 9',
      sample45: 'Örnek 4-5',
      invoiceNoJudgment: 'İlamsız Fatura',
      alimonySample49: 'Nafaka – Örnek 49',
      precautionaryMeasure: 'İhtiyat-İ Tedbir',
      ordinaryRentSample13: 'Adi Kira ve Hasılat Kirası – Örnek 13',
      evictionSample14: 'Tahliye – Örnek 14'
    },
    seizureStatuses: {
      seizedVehicle: 'Hacizli Araç',
      pledgedVehicle: 'Rehinli Araç',
      wantedForSale: 'Yakalamalı / Şatış',
      mortgagedRealEstate: 'İpotekli / Gayrimenkul',
      seizedRealEstate: 'Hacizli / Gayrimenkul'
    },
    compensationLetters: {
      title: 'Teminat Mektupları',
      newLetter: 'Yeni Teminat Mektubu',
      editLetter: 'Teminat Mektubu Düzenle',
      letterInfo: 'Teminat Mektubu Bilgileri',
      editLetterInfo: 'Teminat Mektubu Bilgilerini Düzenle',
      createNewLetter: 'Yeni bir teminat mektubu kaydı oluşturun.',
      searchPlaceholder: 'Mektup numarası, müşteri adı, banka veya mahkeme ile ara...',
      statusFilter: 'Durum filtrele',
      allStatuses: 'Tüm Durumlar',
      responsiblePersonFilter: 'İlgili/Sorumlu Filtrele',
      allResponsiblePersons: 'Tüm Sorumlu Kişiler',
      assignedByFilter: 'Görevlendiren Filtrele',
      allAssignedBy: 'Tüm Görevlendirenler',
      noLettersFound: 'Henüz teminat mektubu bulunmuyor.',
      noLettersMatchingCriteria: 'Arama kriterlerinize uygun teminat mektubu bulunamadı.',
      createFirstLetter: 'İlk Teminat Mektubunu Oluştur',
      letterNo: 'Mektup No',
      bank: 'Banka',
      customerNo: 'Müşteri No',
      customer: 'Müşteri',
      court: 'Mahkeme',
      fileNo: 'Dosya No',
      status: 'Durumu',
      actions: 'İşlemler',
      confirmDelete: 'Bu teminat mektubunu silmek istediğinizden emin misiniz?',
      letterDeleted: 'Teminat mektubu başarıyla silindi.',
      letterDeleteError: 'Teminat mektubu silinirken bir hata oluştu.',
      lettersLoadError: 'Teminat mektupları yüklenirken bir hata oluştu.',
      letterCreated: 'Teminat mektubu başarıyla oluşturuldu.',
      letterUpdated: 'Teminat mektubu başarıyla güncellendi.',
      letterCreateError: 'Teminat mektubu oluşturulurken bir hata oluştu.',
      letterUpdateError: 'Teminat mektubu güncellenirken bir hata oluştu.',
      letterLoadError: 'Teminat mektubu yüklenirken bir hata oluştu.',
      selectClient: 'Müvekkil seçin',
      clientsLoading: 'Müvekkiller yükleniyor...',
      errorOccurred: 'Hata oluştu',
      noClientFound: 'Müvekkil bulunamadı',
      noClientsYet: 'Henüz müvekkil eklenmemiş',
      addClient: 'Müvekkil Ekle',
      selectBank: 'Banka seçin',
      reminderDate: 'Hatırlatma Tarihi',
      selectAssignedBy: 'Görevlendiren seçin',
      selectResponsiblePerson: 'İlgili/Sorumlu seçin',
      selectStatus: 'Durum seçin',
      descriptionText: 'Açıklama',
      descriptionTextPlaceholder: 'Açıklama girin',
      reminderTextLabel: 'Hatırlatma Metni',
      reminderTextPlaceholder: 'Hatırlatma metnini girin',
      conflictError: 'Çakışma Hatası',
      conflictErrorDescription: 'Bu kayıt başka bir kullanıcı tarafından değiştirilmiş. Lütfen sayfayı yenileyin ve tekrar deneyin.'
    },
    compensationLetterStatuses: {
      returned: 'İADE',
      returnRequested: 'İADE İSTENDİ',
      ongoing: 'DEVAM EDİYOR'
    },
    settings: {
      title: 'Ayarlar',
      logout: 'Çıkış Yap',
      changePassword: 'Şifre Değiştir',
      changePasswordDescription: 'Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirin',
      currentPassword: 'Mevcut Şifre',
      newPassword: 'Yeni Şifre',
      confirmNewPassword: 'Yeni Şifre (Tekrar)',
      savePassword: 'Şifreyi Değiştir',
      passwordChanged: 'Şifre başarıyla değiştirildi.',
      passwordChangeError: 'Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.',
      passwordMismatch: 'Yeni şifreler eşleşmiyor.',
      passwordTooShort: 'Yeni şifre en az 6 karakter olmalıdır.',
      backupRestore: 'Yedekleme & Geri Yükleme',
      backupRestoreDescription: 'Verilerinizi yedekleyin veya önceki bir yedekten geri yükleyin',
      downloadBackup: 'Yedekleme İndir',
      backupDownloaded: 'Yedekleme dosyası indirildi.',
      backupError: 'Yedekleme oluşturulamadı.',
      selectBackupFile: 'Yedek Dosyası Seç',
      restoreWarning: 'Geri yükleme işlemi mevcut tüm verileri değiştirecektir.',
      dataRestored: 'Veriler başarıyla geri yüklendi.',
      restoreError: 'Geri yükleme başarısız. Dosya formatını kontrol edin.',
      invalidBackupFormat: 'Geçersiz yedek dosya formatı. JSON dosyası seçtiğinizden emin olun.',
      invalidBackupSections: 'Yedek dosyası geçerli veri bölümleri içermiyor.',
      serverError: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
      appearance: 'Görünüm Ayarları',
      appearanceDescription: 'Arayüz temasını ve görünüm seçeneklerini ayarlayın',
      darkTheme: 'Koyu Tema',
      enableDarkTheme: 'Koyu renk temasını etkinleştirin',
      themeChanged: 'Tema Değiştirildi',
      lightThemeEnabled: 'Açık tema aktif edildi.',
      darkThemeEnabled: 'Koyu tema aktif edildi.',
      autoBackup: 'Otomatik Yedekleme',
      autoBackupDescription: 'Verileriniz otomatik olarak yedeklenir',
      autoBackupEnabled: 'Otomatik Yedekleme',
      dailyAutoBackupActive: 'Günlük otomatik yedekleme aktif',
      lastBackup: 'Son yedekleme',
      nextBackup: 'Sonraki yedekleme',
      language: 'Dil',
      languageDescription: 'Uygulama dilini seçin',
      selectLanguage: 'Dil seçin',
      languageChanged: 'Dil değiştirildi'
    },
    languages: {
      turkish: 'Türkçe',
      english: 'English',
      german: 'Deutsch'
    },
    responsiblePersons: {
      avMSerifBey: 'Av.M.Şerif Bey',
      omerBey: 'Ömer Bey',
      avIbrahimBey: 'Av.İbrahim Bey',
      avKenanBey: 'Av.Kenan Bey',
      ismailBey: 'İsmail Bey',
      ebruHanim: 'Ebru Hanım',
      pinarHanim: 'Pınar Hanım',
      yarenHanim: 'Yaren Hanım'
    }
  },
  
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      update: 'Update',
      back: 'Back',
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      saving: 'Saving...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      all: 'All',
      none: 'None',
      actions: 'Actions',
      retry: 'Retry',
      noResults: 'No results found.',
      required: '*'
    },
    nav: {
      home: 'Home',
      cases: 'Case Files',
      executions: 'Executions',
      compensationLetters: 'Compensation Letters',
      clients: 'Clients',
      settings: 'Settings'
    },
    login: {
      title: 'LexCloud',
      subtitle: 'Login to the case tracking system',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      loginButton: 'Login',
      loggingIn: 'Logging in...',
      wrongPassword: 'Wrong password. Please try again.'
    },
    dashboard: {
      title: 'Home',
      totalCases: 'Total Cases',
      totalExecutions: 'Total Executions',
      totalCompensationLetters: 'Total Compensation Letters',
      totalClients: 'Total Clients',
      noCasesYet: 'No cases added yet',
      noExecutionsYet: 'No executions added yet',
      noCompensationLettersYet: 'No compensation letters added yet',
      noClientsYet: 'No clients added yet',
      reminders: 'Reminders',
      todayReminders: 'Reminders for today',
      noRemindersToday: 'No reminders for today.',
      noRemindersForFilter: 'No reminders for today.',
      startByAddingCasesAndClients: 'Start by adding cases and clients.',
      newCase: 'New Case',
      newClient: 'New Client',
      apiActive: 'Active',
      apiError: 'Error',
      wsConnected: 'Connected',
      wsPolling: 'Polling',
      wsClosed: 'Closed',
      dbActive: 'Active',
      dbError: 'Error',
      caseFiles: 'Case Files',
      executionFiles: 'Executions',
      compensationLettersFilter: 'Compensation Letters',
      fileNo: 'File No',
      caseName: 'Case Name',
      court: 'Court',
      client: 'Client',
      defendant: 'Defendant',
      reminder: 'Reminder',
      reminderText: 'Reminder Text',
      executionFileNo: 'Execution File No',
      execution: 'Execution',
      letterNo: 'Letter No',
      customer: 'Customer',
      assignedBy: 'Assigned By',
      responsiblePerson: 'Responsible Person'
    },
    cases: {
      title: 'Case Files',
      newCase: 'New Case',
      editCase: 'Edit Case',
      caseInfo: 'Create New Case',
      editCaseInfo: 'Edit Case Information',
      createNewCase: 'Create a new case record.',
      updateExistingCase: 'Update existing case information.',
      createNewCaseRecord: 'Create a new case record.',
      searchPlaceholder: 'Search by case title, client name, case number, case name or defendant...',
      statusFilter: 'Filter by status',
      allStatuses: 'All Statuses',
      responsiblePersonFilter: 'Filter by Responsible Person',
      allResponsiblePersons: 'All Responsible Persons',
      assignedByFilter: 'Filter by Assigned By',
      allAssignedBy: 'All Assigners',
      noCasesFound: 'No cases found yet.',
      noCasesMatchingCriteria: 'No cases matching your search criteria.',
      createFirstCase: 'Create First Case',
      court: 'Court',
      fileNo: 'File No',
      client: 'Client',
      defendant: 'Defendant',
      caseName: 'Case Name',
      reminderDate: 'Reminder Date',
      reminderText: 'Reminder Text',
      actions: 'Actions',
      confirmDelete: 'Are you sure you want to delete this case?',
      caseDeleted: 'Case deleted successfully.',
      caseDeleteError: 'An error occurred while deleting the case.',
      casesLoadError: 'An error occurred while loading case files.',
      caseCreated: 'Case created successfully.',
      caseUpdated: 'Case updated successfully.',
      caseCreateError: 'An error occurred while creating the case.',
      caseUpdateError: 'An error occurred while updating the case.',
      caseLoadError: 'An error occurred while loading case information.',
      selectClient: 'Select client',
      clientsLoading: 'Loading clients...',
      errorOccurred: 'Error occurred',
      noClientFound: 'No client found',
      noClientsYet: 'No clients added yet',
      addClient: 'Add Client',
      caseNamePlaceholder: 'Enter case name',
      defendantPlaceholder: 'Enter defendant name',
      courtPlaceholder: 'Enter court name manually',
      caseNumberPlaceholder: 'Enter case number',
      selectStatus: 'Select status',
      selectCaseType: 'Select case type',
      openingDate: 'Opening Date',
      hearingDate: 'Hearing Date',
      officeArchiveNo: 'Office Archive No',
      officeArchiveNoPlaceholder: 'Enter office archive number',
      selectResponsiblePerson: 'Select responsible person',
      selectAssignedBy: 'Select assigner',
      notes: 'Notes',
      notesPlaceholder: 'Enter your notes',
      conflictError: 'Conflict Error',
      conflictErrorDescription: 'This record has been modified by another user. Please refresh the page and try again.',
      waitForClientsLoading: 'Please wait while clients are loading.',
      selectValidClient: 'Please select a valid client.'
    },
    caseStatuses: {
      acquittal: 'Acquittal',
      penalty: 'Penalty',
      partialAcceptPartialReject: 'Partial Accept Partial Reject',
      accepted: 'Accepted',
      rejected: 'Rejected',
      appeal: 'Appeal',
      regionalAppeal: 'Regional Appeal',
      pending: 'Pending',
      finalization: 'Finalization',
      awaitingDecision: 'Awaiting Decision',
      expert: 'Expert',
      concordat: 'Concordat'
    },
    caseTypes: {
      criminal: 'Criminal',
      civil: 'Civil',
      execution: 'Execution',
      administrative: 'Administrative',
      salesOffice: 'Sales Office',
      mediation: 'Mediation',
      cbs: 'CBS',
      compensationCommission: 'Compensation Commission'
    },
    clients: {
      title: 'Clients',
      newClient: 'New Client',
      editClient: 'Edit Client',
      clientInfo: 'Create New Client',
      editClientInfo: 'Edit Client Information',
      createNewClient: 'Create a new client record.',
      updateExistingClient: 'Update existing client information.',
      createNewClientRecord: 'Create a new client record.',
      searchPlaceholder: 'Search by name, email, phone or power of attorney office no...',
      noClientsFound: 'No clients found yet.',
      noClientsMatchingCriteria: 'No clients matching your search criteria.',
      addFirstClient: 'Add First Client',
      registration: 'Registration',
      confirmDelete: 'Are you sure you want to delete this client?',
      clientDeleted: 'Client deleted successfully.',
      clientDeleteError: 'An error occurred while deleting the client.',
      clientDeleteErrorWithCases: 'Cannot delete this client because they have existing case files.',
      clientsLoadError: 'An error occurred while loading clients.',
      clientCreated: 'Client created successfully.',
      clientUpdated: 'Client updated successfully.',
      clientCreateError: 'An error occurred while creating the client.',
      clientUpdateError: 'An error occurred while updating the client.',
      clientLoadError: 'An error occurred while loading client information.',
      name: 'Full Name',
      namePlaceholder: 'Enter client name',
      vekaletInfo: 'Power of Attorney Info',
      vekaletInfoPlaceholder: 'Enter power of attorney information',
      phone: 'Phone',
      phonePlaceholder: 'Enter phone number',
      vekaletOfficeNo: 'Power of Attorney Office No',
      vekaletOfficeNoPlaceholder: 'Enter power of attorney office number',
      taxId: 'Client ID or Tax No',
      taxIdPlaceholder: 'Enter ID or Tax Number',
      address: 'Address',
      addressPlaceholder: 'Enter client address'
    },
    executions: {
      title: 'Executions',
      newExecution: 'New Execution',
      editExecution: 'Edit Execution',
      executionInfo: 'Create New Execution',
      editExecutionInfo: 'Edit Execution Information',
      createNewExecution: 'Create a new execution record.',
      updateExistingExecution: 'Update existing execution information.',
      createNewExecutionRecord: 'Create a new execution record.',
      executionList: 'Execution List',
      viewAndManageExecutions: 'View and manage all your execution records.',
      searchPlaceholder: 'Search by client, defendant or execution file no...',
      statusFilter: 'Filter by status',
      allStatuses: 'All Statuses',
      executionTypeFilter: 'Filter by execution type',
      allExecutionTypes: 'All Execution Types',
      seizureStatusFilter: 'Filter by seizure status',
      allSeizureStatuses: 'All Seizure Statuses',
      responsiblePersonFilter: 'Filter by Responsible Person',
      allResponsiblePersons: 'All Responsible Persons',
      assignedByFilter: 'Filter by Assigned By',
      allAssignedBy: 'All Assigners',
      noExecutionsFound: 'No execution records found yet.',
      noExecutionsMatchingCriteria: 'No executions matching your filter criteria.',
      execution: 'Execution',
      executionFileNo: 'Execution File No',
      client: 'Client',
      defendant: 'Defendant',
      status: 'Status',
      seizureStatus: 'Seizure Status',
      openingDate: 'Opening Date',
      reminder: 'Reminder',
      actions: 'Actions',
      confirmDelete: 'Are you sure you want to delete this execution?',
      executionDeleted: 'Execution deleted successfully.',
      executionDeleteError: 'An error occurred while deleting the execution.',
      executionsLoadError: 'An error occurred while loading executions.',
      executionCreated: 'Execution created successfully.',
      executionUpdated: 'Execution updated successfully.',
      executionCreateError: 'An error occurred while creating the execution.',
      executionUpdateError: 'An error occurred while updating the execution.',
      executionLoadError: 'An error occurred while loading execution information.',
      selectClient: 'Select client',
      clientsLoading: 'Loading clients...',
      errorOccurred: 'Error occurred',
      noClientFound: 'No client found',
      noClientsYet: 'No clients added yet',
      addClient: 'Add Client',
      defendantPlaceholder: 'Enter defendant name',
      executionOffice: 'Execution Office',
      executionOfficePlaceholder: 'Select or type execution office...',
      executionNumberPlaceholder: 'Enter execution number',
      selectStatus: 'Select status',
      selectExecutionType: 'Select execution type',
      selectSeizureStatus: 'Select seizure status',
      officeArchiveNo: 'Office Archive No',
      officeArchiveNoPlaceholder: 'Enter office archive number',
      reminderDate: 'Reminder Date',
      reminderTextLabel: 'Reminder Text',
      reminderTextPlaceholder: 'Enter reminder text',
      selectResponsiblePerson: 'Select responsible person',
      selectAssignedBy: 'Select assigner',
      notes: 'Notes',
      notesPlaceholder: 'Enter your notes',
      timeoutError: 'Timeout while loading clients. Please refresh the page.',
      conflictError: 'Conflict Error',
      conflictErrorDescription: 'This record has been modified by another user. Please refresh the page and try again.',
      waitForClientsLoading: 'Please wait while clients are loading.',
      selectValidClient: 'Please select a client.',
      selectClientFromList: 'Selected client is invalid. Please select a client from the list.'
    },
    executionStatuses: {
      pending: 'Pending',
      enforcement: 'Enforcement',
      externalCollection: 'External Collection',
      objected: 'Objected',
      executionPostponed: 'Execution Postponed',
      sued: 'Sued',
      paymentPromise: 'Payment Promise',
      expert: 'Expert'
    },
    executionTypes: {
      creditCardNoJudgment: 'Credit Card (No Judgment)',
      consumerLoanNoJudgment: 'Consumer Loan (No Judgment)',
      gksNoJudgment: 'GKS (No Judgment)',
      billOfExchange: 'Bill of Exchange',
      check: 'Check',
      checkNoJudgment: 'Check (No Judgment)',
      pledgeSample8: 'Pledge - Sample 8',
      mortgageSample6: 'Mortgage - Sample 6',
      mortgageSample9: 'Mortgage - Sample 9',
      sample45: 'Sample 4-5',
      invoiceNoJudgment: 'Invoice (No Judgment)',
      alimonySample49: 'Alimony - Sample 49',
      precautionaryMeasure: 'Precautionary Measure',
      ordinaryRentSample13: 'Ordinary Rent - Sample 13',
      evictionSample14: 'Eviction - Sample 14'
    },
    seizureStatuses: {
      seizedVehicle: 'Seized Vehicle',
      pledgedVehicle: 'Pledged Vehicle',
      wantedForSale: 'Wanted for Sale',
      mortgagedRealEstate: 'Mortgaged Real Estate',
      seizedRealEstate: 'Seized Real Estate'
    },
    compensationLetters: {
      title: 'Compensation Letters',
      newLetter: 'New Compensation Letter',
      editLetter: 'Edit Compensation Letter',
      letterInfo: 'Compensation Letter Information',
      editLetterInfo: 'Edit Compensation Letter Information',
      createNewLetter: 'Create a new compensation letter record.',
      searchPlaceholder: 'Search by letter number, customer name, bank or court...',
      statusFilter: 'Filter by status',
      allStatuses: 'All Statuses',
      responsiblePersonFilter: 'Filter by Responsible Person',
      allResponsiblePersons: 'All Responsible Persons',
      assignedByFilter: 'Filter by Assigned By',
      allAssignedBy: 'All Assigners',
      noLettersFound: 'No compensation letters found yet.',
      noLettersMatchingCriteria: 'No compensation letters matching your search criteria.',
      createFirstLetter: 'Create First Compensation Letter',
      letterNo: 'Letter No',
      bank: 'Bank',
      customerNo: 'Customer No',
      customer: 'Customer',
      court: 'Court',
      fileNo: 'File No',
      status: 'Status',
      actions: 'Actions',
      confirmDelete: 'Are you sure you want to delete this compensation letter?',
      letterDeleted: 'Compensation letter deleted successfully.',
      letterDeleteError: 'An error occurred while deleting the compensation letter.',
      lettersLoadError: 'An error occurred while loading compensation letters.',
      letterCreated: 'Compensation letter created successfully.',
      letterUpdated: 'Compensation letter updated successfully.',
      letterCreateError: 'An error occurred while creating the compensation letter.',
      letterUpdateError: 'An error occurred while updating the compensation letter.',
      letterLoadError: 'An error occurred while loading compensation letter.',
      selectClient: 'Select client',
      clientsLoading: 'Loading clients...',
      errorOccurred: 'Error occurred',
      noClientFound: 'No client found',
      noClientsYet: 'No clients added yet',
      addClient: 'Add Client',
      selectBank: 'Select bank',
      reminderDate: 'Reminder Date',
      selectAssignedBy: 'Select assigner',
      selectResponsiblePerson: 'Select responsible person',
      selectStatus: 'Select status',
      descriptionText: 'Description',
      descriptionTextPlaceholder: 'Enter description',
      reminderTextLabel: 'Reminder Text',
      reminderTextPlaceholder: 'Enter reminder text',
      conflictError: 'Conflict Error',
      conflictErrorDescription: 'This record has been modified by another user. Please refresh the page and try again.'
    },
    compensationLetterStatuses: {
      returned: 'RETURNED',
      returnRequested: 'RETURN REQUESTED',
      ongoing: 'ONGOING'
    },
    settings: {
      title: 'Settings',
      logout: 'Logout',
      changePassword: 'Change Password',
      changePasswordDescription: 'Change your password regularly for account security',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmNewPassword: 'Confirm New Password',
      savePassword: 'Change Password',
      passwordChanged: 'Password changed successfully.',
      passwordChangeError: 'Could not change password. Check your current password.',
      passwordMismatch: 'New passwords do not match.',
      passwordTooShort: 'New password must be at least 6 characters.',
      backupRestore: 'Backup & Restore',
      backupRestoreDescription: 'Backup your data or restore from a previous backup',
      downloadBackup: 'Download Backup',
      backupDownloaded: 'Backup file downloaded.',
      backupError: 'Could not create backup.',
      selectBackupFile: 'Select Backup File',
      restoreWarning: 'Restore operation will replace all existing data.',
      dataRestored: 'Data restored successfully.',
      restoreError: 'Restore failed. Check the file format.',
      invalidBackupFormat: 'Invalid backup file format. Make sure you selected a JSON file.',
      invalidBackupSections: 'Backup file does not contain valid data sections.',
      serverError: 'Server error. Please try again later.',
      appearance: 'Appearance Settings',
      appearanceDescription: 'Set interface theme and appearance options',
      darkTheme: 'Dark Theme',
      enableDarkTheme: 'Enable dark color theme',
      themeChanged: 'Theme Changed',
      lightThemeEnabled: 'Light theme enabled.',
      darkThemeEnabled: 'Dark theme enabled.',
      autoBackup: 'Automatic Backup',
      autoBackupDescription: 'Your data is automatically backed up',
      autoBackupEnabled: 'Automatic Backup',
      dailyAutoBackupActive: 'Daily automatic backup active',
      lastBackup: 'Last backup',
      nextBackup: 'Next backup',
      language: 'Language',
      languageDescription: 'Select application language',
      selectLanguage: 'Select language',
      languageChanged: 'Language changed'
    },
    languages: {
      turkish: 'Türkçe',
      english: 'English',
      german: 'Deutsch'
    },
    responsiblePersons: {
      avMSerifBey: 'Av.M.Şerif Bey',
      omerBey: 'Ömer Bey',
      avIbrahimBey: 'Av.İbrahim Bey',
      avKenanBey: 'Av.Kenan Bey',
      ismailBey: 'İsmail Bey',
      ebruHanim: 'Ebru Hanım',
      pinarHanim: 'Pınar Hanım',
      yarenHanim: 'Yaren Hanım'
    }
  },
  
  de: {
    common: {
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      create: 'Erstellen',
      update: 'Aktualisieren',
      back: 'Zurück',
      search: 'Suchen',
      filter: 'Filtern',
      loading: 'Wird geladen...',
      saving: 'Wird gespeichert...',
      error: 'Fehler',
      success: 'Erfolg',
      warning: 'Warnung',
      confirm: 'Bestätigen',
      yes: 'Ja',
      no: 'Nein',
      all: 'Alle',
      none: 'Keine',
      actions: 'Aktionen',
      retry: 'Erneut versuchen',
      noResults: 'Keine Ergebnisse gefunden.',
      required: '*'
    },
    nav: {
      home: 'Startseite',
      cases: 'Fallakten',
      executions: 'Vollstreckungen',
      compensationLetters: 'Garantiebriefe',
      clients: 'Mandanten',
      settings: 'Einstellungen'
    },
    login: {
      title: 'LexCloud',
      subtitle: 'Anmeldung zum Fallverfolgungssystem',
      password: 'Passwort',
      passwordPlaceholder: 'Geben Sie Ihr Passwort ein',
      loginButton: 'Anmelden',
      loggingIn: 'Anmeldung läuft...',
      wrongPassword: 'Falsches Passwort. Bitte versuchen Sie es erneut.'
    },
    dashboard: {
      title: 'Startseite',
      totalCases: 'Gesamtfälle',
      totalExecutions: 'Gesamtvollstreckungen',
      totalCompensationLetters: 'Gesamtgarantiebriefe',
      totalClients: 'Gesamtmandanten',
      noCasesYet: 'Noch keine Fälle hinzugefügt',
      noExecutionsYet: 'Noch keine Vollstreckungen hinzugefügt',
      noCompensationLettersYet: 'Noch keine Garantiebriefe hinzugefügt',
      noClientsYet: 'Noch keine Mandanten hinzugefügt',
      reminders: 'Erinnerungen',
      todayReminders: 'Erinnerungen für heute',
      noRemindersToday: 'Keine Erinnerungen für heute.',
      noRemindersForFilter: 'Keine Erinnerungen für heute.',
      startByAddingCasesAndClients: 'Beginnen Sie mit dem Hinzufügen von Fällen und Mandanten.',
      newCase: 'Neuer Fall',
      newClient: 'Neuer Mandant',
      apiActive: 'Aktiv',
      apiError: 'Fehler',
      wsConnected: 'Verbunden',
      wsPolling: 'Polling',
      wsClosed: 'Geschlossen',
      dbActive: 'Aktiv',
      dbError: 'Fehler',
      caseFiles: 'Fallakten',
      executionFiles: 'Vollstreckungen',
      compensationLettersFilter: 'Garantiebriefe',
      fileNo: 'Aktenzeichen',
      caseName: 'Fallname',
      court: 'Gericht',
      client: 'Mandant',
      defendant: 'Beklagter',
      reminder: 'Erinnerung',
      reminderText: 'Erinnerungstext',
      executionFileNo: 'Vollstreckungsaktenzeichen',
      execution: 'Vollstreckung',
      letterNo: 'Briefnummer',
      customer: 'Kunde',
      assignedBy: 'Zugewiesen von',
      responsiblePerson: 'Verantwortliche Person'
    },
    cases: {
      title: 'Fallakten',
      newCase: 'Neuer Fall',
      editCase: 'Fall bearbeiten',
      caseInfo: 'Neuen Fall erstellen',
      editCaseInfo: 'Fallinformationen bearbeiten',
      createNewCase: 'Einen neuen Falldatensatz erstellen.',
      updateExistingCase: 'Bestehende Fallinformationen aktualisieren.',
      createNewCaseRecord: 'Einen neuen Falldatensatz erstellen.',
      searchPlaceholder: 'Suche nach Falltitel, Mandantenname, Fallnummer, Fallname oder Beklagter...',
      statusFilter: 'Nach Status filtern',
      allStatuses: 'Alle Status',
      responsiblePersonFilter: 'Nach verantwortlicher Person filtern',
      allResponsiblePersons: 'Alle verantwortlichen Personen',
      assignedByFilter: 'Nach Zuweiser filtern',
      allAssignedBy: 'Alle Zuweiser',
      noCasesFound: 'Noch keine Fälle gefunden.',
      noCasesMatchingCriteria: 'Keine Fälle entsprechen Ihren Suchkriterien.',
      createFirstCase: 'Ersten Fall erstellen',
      court: 'Gericht',
      fileNo: 'Aktenzeichen',
      client: 'Mandant',
      defendant: 'Beklagter',
      caseName: 'Fallname',
      reminderDate: 'Erinnerungsdatum',
      reminderText: 'Erinnerungstext',
      actions: 'Aktionen',
      confirmDelete: 'Sind Sie sicher, dass Sie diesen Fall löschen möchten?',
      caseDeleted: 'Fall erfolgreich gelöscht.',
      caseDeleteError: 'Beim Löschen des Falls ist ein Fehler aufgetreten.',
      casesLoadError: 'Beim Laden der Fallakten ist ein Fehler aufgetreten.',
      caseCreated: 'Fall erfolgreich erstellt.',
      caseUpdated: 'Fall erfolgreich aktualisiert.',
      caseCreateError: 'Beim Erstellen des Falls ist ein Fehler aufgetreten.',
      caseUpdateError: 'Beim Aktualisieren des Falls ist ein Fehler aufgetreten.',
      caseLoadError: 'Beim Laden der Fallinformationen ist ein Fehler aufgetreten.',
      selectClient: 'Mandant auswählen',
      clientsLoading: 'Mandanten werden geladen...',
      errorOccurred: 'Fehler aufgetreten',
      noClientFound: 'Kein Mandant gefunden',
      noClientsYet: 'Noch keine Mandanten hinzugefügt',
      addClient: 'Mandant hinzufügen',
      caseNamePlaceholder: 'Fallnamen eingeben',
      defendantPlaceholder: 'Beklagtennamen eingeben',
      courtPlaceholder: 'Gerichtsnamen manuell eingeben',
      caseNumberPlaceholder: 'Fallnummer eingeben',
      selectStatus: 'Status auswählen',
      selectCaseType: 'Falltyp auswählen',
      openingDate: 'Eröffnungsdatum',
      hearingDate: 'Verhandlungsdatum',
      officeArchiveNo: 'Büroarchivnummer',
      officeArchiveNoPlaceholder: 'Büroarchivnummer eingeben',
      selectResponsiblePerson: 'Verantwortliche Person auswählen',
      selectAssignedBy: 'Zuweiser auswählen',
      notes: 'Notizen',
      notesPlaceholder: 'Geben Sie Ihre Notizen ein',
      conflictError: 'Konfliktfehler',
      conflictErrorDescription: 'Dieser Datensatz wurde von einem anderen Benutzer geändert. Bitte aktualisieren Sie die Seite und versuchen Sie es erneut.',
      waitForClientsLoading: 'Bitte warten Sie, während die Mandanten geladen werden.',
      selectValidClient: 'Bitte wählen Sie einen gültigen Mandanten aus.'
    },
    caseStatuses: {
      acquittal: 'Freispruch',
      penalty: 'Strafe',
      partialAcceptPartialReject: 'Teilweise angenommen, teilweise abgelehnt',
      accepted: 'Angenommen',
      rejected: 'Abgelehnt',
      appeal: 'Berufung',
      regionalAppeal: 'Regionale Berufung',
      pending: 'Anhängig',
      finalization: 'Abschluss',
      awaitingDecision: 'Entscheidung ausstehend',
      expert: 'Sachverständiger',
      concordat: 'Vergleich'
    },
    caseTypes: {
      criminal: 'Strafrecht',
      civil: 'Zivilrecht',
      execution: 'Vollstreckung',
      administrative: 'Verwaltungsrecht',
      salesOffice: 'Verkaufsbüro',
      mediation: 'Mediation',
      cbs: 'CBS',
      compensationCommission: 'Entschädigungskommission'
    },
    clients: {
      title: 'Mandanten',
      newClient: 'Neuer Mandant',
      editClient: 'Mandant bearbeiten',
      clientInfo: 'Neuen Mandanten erstellen',
      editClientInfo: 'Mandanteninformationen bearbeiten',
      createNewClient: 'Einen neuen Mandantendatensatz erstellen.',
      updateExistingClient: 'Bestehende Mandanteninformationen aktualisieren.',
      createNewClientRecord: 'Einen neuen Mandantendatensatz erstellen.',
      searchPlaceholder: 'Suche nach Name, E-Mail, Telefon oder Vollmachtsbüronummer...',
      noClientsFound: 'Noch keine Mandanten gefunden.',
      noClientsMatchingCriteria: 'Keine Mandanten entsprechen Ihren Suchkriterien.',
      addFirstClient: 'Ersten Mandanten hinzufügen',
      registration: 'Registrierung',
      confirmDelete: 'Sind Sie sicher, dass Sie diesen Mandanten löschen möchten?',
      clientDeleted: 'Mandant erfolgreich gelöscht.',
      clientDeleteError: 'Beim Löschen des Mandanten ist ein Fehler aufgetreten.',
      clientDeleteErrorWithCases: 'Dieser Mandant kann nicht gelöscht werden, da er bestehende Fallakten hat.',
      clientsLoadError: 'Beim Laden der Mandanten ist ein Fehler aufgetreten.',
      clientCreated: 'Mandant erfolgreich erstellt.',
      clientUpdated: 'Mandant erfolgreich aktualisiert.',
      clientCreateError: 'Beim Erstellen des Mandanten ist ein Fehler aufgetreten.',
      clientUpdateError: 'Beim Aktualisieren des Mandanten ist ein Fehler aufgetreten.',
      clientLoadError: 'Beim Laden der Mandanteninformationen ist ein Fehler aufgetreten.',
      name: 'Vollständiger Name',
      namePlaceholder: 'Mandantenname eingeben',
      vekaletInfo: 'Vollmachtsinformationen',
      vekaletInfoPlaceholder: 'Vollmachtsinformationen eingeben',
      phone: 'Telefon',
      phonePlaceholder: 'Telefonnummer eingeben',
      vekaletOfficeNo: 'Vollmachtsbüronummer',
      vekaletOfficeNoPlaceholder: 'Vollmachtsbüronummer eingeben',
      taxId: 'Mandanten-ID oder Steuernummer',
      taxIdPlaceholder: 'ID oder Steuernummer eingeben',
      address: 'Adresse',
      addressPlaceholder: 'Mandantenadresse eingeben'
    },
    executions: {
      title: 'Vollstreckungen',
      newExecution: 'Neue Vollstreckung',
      editExecution: 'Vollstreckung bearbeiten',
      executionInfo: 'Neue Vollstreckung erstellen',
      editExecutionInfo: 'Vollstreckungsinformationen bearbeiten',
      createNewExecution: 'Einen neuen Vollstreckungsdatensatz erstellen.',
      updateExistingExecution: 'Bestehende Vollstreckungsinformationen aktualisieren.',
      createNewExecutionRecord: 'Einen neuen Vollstreckungsdatensatz erstellen.',
      executionList: 'Vollstreckungsliste',
      viewAndManageExecutions: 'Alle Ihre Vollstreckungsdatensätze anzeigen und verwalten.',
      searchPlaceholder: 'Suche nach Mandant, Beklagter oder Vollstreckungsaktenzeichen...',
      statusFilter: 'Nach Status filtern',
      allStatuses: 'Alle Status',
      executionTypeFilter: 'Nach Vollstreckungstyp filtern',
      allExecutionTypes: 'Alle Vollstreckungstypen',
      seizureStatusFilter: 'Nach Pfändungsstatus filtern',
      allSeizureStatuses: 'Alle Pfändungsstatus',
      responsiblePersonFilter: 'Nach verantwortlicher Person filtern',
      allResponsiblePersons: 'Alle verantwortlichen Personen',
      assignedByFilter: 'Nach Zuweiser filtern',
      allAssignedBy: 'Alle Zuweiser',
      noExecutionsFound: 'Noch keine Vollstreckungsdatensätze gefunden.',
      noExecutionsMatchingCriteria: 'Keine Vollstreckungen entsprechen Ihren Filterkriterien.',
      execution: 'Vollstreckung',
      executionFileNo: 'Vollstreckungsaktenzeichen',
      client: 'Mandant',
      defendant: 'Beklagter',
      status: 'Status',
      seizureStatus: 'Pfändungsstatus',
      openingDate: 'Eröffnungsdatum',
      reminder: 'Erinnerung',
      actions: 'Aktionen',
      confirmDelete: 'Sind Sie sicher, dass Sie diese Vollstreckung löschen möchten?',
      executionDeleted: 'Vollstreckung erfolgreich gelöscht.',
      executionDeleteError: 'Beim Löschen der Vollstreckung ist ein Fehler aufgetreten.',
      executionsLoadError: 'Beim Laden der Vollstreckungen ist ein Fehler aufgetreten.',
      executionCreated: 'Vollstreckung erfolgreich erstellt.',
      executionUpdated: 'Vollstreckung erfolgreich aktualisiert.',
      executionCreateError: 'Beim Erstellen der Vollstreckung ist ein Fehler aufgetreten.',
      executionUpdateError: 'Beim Aktualisieren der Vollstreckung ist ein Fehler aufgetreten.',
      executionLoadError: 'Beim Laden der Vollstreckungsinformationen ist ein Fehler aufgetreten.',
      selectClient: 'Mandant auswählen',
      clientsLoading: 'Mandanten werden geladen...',
      errorOccurred: 'Fehler aufgetreten',
      noClientFound: 'Kein Mandant gefunden',
      noClientsYet: 'Noch keine Mandanten hinzugefügt',
      addClient: 'Mandant hinzufügen',
      defendantPlaceholder: 'Beklagtennamen eingeben',
      executionOffice: 'Vollstreckungsbüro',
      executionOfficePlaceholder: 'Vollstreckungsbüro auswählen oder eingeben...',
      executionNumberPlaceholder: 'Vollstreckungsnummer eingeben',
      selectStatus: 'Status auswählen',
      selectExecutionType: 'Vollstreckungstyp auswählen',
      selectSeizureStatus: 'Pfändungsstatus auswählen',
      officeArchiveNo: 'Büroarchivnummer',
      officeArchiveNoPlaceholder: 'Büroarchivnummer eingeben',
      reminderDate: 'Erinnerungsdatum',
      reminderTextLabel: 'Erinnerungstext',
      reminderTextPlaceholder: 'Erinnerungstext eingeben',
      selectResponsiblePerson: 'Verantwortliche Person auswählen',
      selectAssignedBy: 'Zuweiser auswählen',
      notes: 'Notizen',
      notesPlaceholder: 'Geben Sie Ihre Notizen ein',
      timeoutError: 'Zeitüberschreitung beim Laden der Mandanten. Bitte aktualisieren Sie die Seite.',
      conflictError: 'Konfliktfehler',
      conflictErrorDescription: 'Dieser Datensatz wurde von einem anderen Benutzer geändert. Bitte aktualisieren Sie die Seite und versuchen Sie es erneut.',
      waitForClientsLoading: 'Bitte warten Sie, während die Mandanten geladen werden.',
      selectValidClient: 'Bitte wählen Sie einen Mandanten aus.',
      selectClientFromList: 'Ausgewählter Mandant ist ungültig. Bitte wählen Sie einen Mandanten aus der Liste.'
    },
    executionStatuses: {
      pending: 'Anhängig',
      enforcement: 'Vollstreckung',
      externalCollection: 'Externe Einziehung',
      objected: 'Einspruch erhoben',
      executionPostponed: 'Vollstreckung aufgeschoben',
      sued: 'Verklagt',
      paymentPromise: 'Zahlungsversprechen',
      expert: 'Sachverständiger'
    },
    executionTypes: {
      creditCardNoJudgment: 'Kreditkarte (ohne Urteil)',
      consumerLoanNoJudgment: 'Verbraucherkredit (ohne Urteil)',
      gksNoJudgment: 'GKS (ohne Urteil)',
      billOfExchange: 'Wechsel',
      check: 'Scheck',
      checkNoJudgment: 'Scheck (ohne Urteil)',
      pledgeSample8: 'Pfand - Muster 8',
      mortgageSample6: 'Hypothek - Muster 6',
      mortgageSample9: 'Hypothek - Muster 9',
      sample45: 'Muster 4-5',
      invoiceNoJudgment: 'Rechnung (ohne Urteil)',
      alimonySample49: 'Unterhalt - Muster 49',
      precautionaryMeasure: 'Vorsorgliche Maßnahme',
      ordinaryRentSample13: 'Gewöhnliche Miete - Muster 13',
      evictionSample14: 'Räumung - Muster 14'
    },
    seizureStatuses: {
      seizedVehicle: 'Gepfändetes Fahrzeug',
      pledgedVehicle: 'Verpfändetes Fahrzeug',
      wantedForSale: 'Zum Verkauf gesucht',
      mortgagedRealEstate: 'Hypothekenbelastete Immobilie',
      seizedRealEstate: 'Gepfändete Immobilie'
    },
    compensationLetters: {
      title: 'Garantiebriefe',
      newLetter: 'Neuer Garantiebrief',
      editLetter: 'Garantiebrief bearbeiten',
      letterInfo: 'Garantiebriefinformationen',
      editLetterInfo: 'Garantiebriefinformationen bearbeiten',
      createNewLetter: 'Einen neuen Garantiebriefdatensatz erstellen.',
      searchPlaceholder: 'Suche nach Briefnummer, Kundenname, Bank oder Gericht...',
      statusFilter: 'Nach Status filtern',
      allStatuses: 'Alle Status',
      responsiblePersonFilter: 'Nach verantwortlicher Person filtern',
      allResponsiblePersons: 'Alle verantwortlichen Personen',
      assignedByFilter: 'Nach Zuweiser filtern',
      allAssignedBy: 'Alle Zuweiser',
      noLettersFound: 'Noch keine Garantiebriefe gefunden.',
      noLettersMatchingCriteria: 'Keine Garantiebriefe entsprechen Ihren Suchkriterien.',
      createFirstLetter: 'Ersten Garantiebrief erstellen',
      letterNo: 'Briefnummer',
      bank: 'Bank',
      customerNo: 'Kundennummer',
      customer: 'Kunde',
      court: 'Gericht',
      fileNo: 'Aktenzeichen',
      status: 'Status',
      actions: 'Aktionen',
      confirmDelete: 'Sind Sie sicher, dass Sie diesen Garantiebrief löschen möchten?',
      letterDeleted: 'Garantiebrief erfolgreich gelöscht.',
      letterDeleteError: 'Beim Löschen des Garantiebriefs ist ein Fehler aufgetreten.',
      lettersLoadError: 'Beim Laden der Garantiebriefe ist ein Fehler aufgetreten.',
      letterCreated: 'Garantiebrief erfolgreich erstellt.',
      letterUpdated: 'Garantiebrief erfolgreich aktualisiert.',
      letterCreateError: 'Beim Erstellen des Garantiebriefs ist ein Fehler aufgetreten.',
      letterUpdateError: 'Beim Aktualisieren des Garantiebriefs ist ein Fehler aufgetreten.',
      letterLoadError: 'Beim Laden des Garantiebriefs ist ein Fehler aufgetreten.',
      selectClient: 'Mandant auswählen',
      clientsLoading: 'Mandanten werden geladen...',
      errorOccurred: 'Fehler aufgetreten',
      noClientFound: 'Kein Mandant gefunden',
      noClientsYet: 'Noch keine Mandanten hinzugefügt',
      addClient: 'Mandant hinzufügen',
      selectBank: 'Bank auswählen',
      reminderDate: 'Erinnerungsdatum',
      selectAssignedBy: 'Zuweiser auswählen',
      selectResponsiblePerson: 'Verantwortliche Person auswählen',
      selectStatus: 'Status auswählen',
      descriptionText: 'Beschreibung',
      descriptionTextPlaceholder: 'Beschreibung eingeben',
      reminderTextLabel: 'Erinnerungstext',
      reminderTextPlaceholder: 'Erinnerungstext eingeben',
      conflictError: 'Konfliktfehler',
      conflictErrorDescription: 'Dieser Datensatz wurde von einem anderen Benutzer geändert. Bitte aktualisieren Sie die Seite und versuchen Sie es erneut.'
    },
    compensationLetterStatuses: {
      returned: 'ZURÜCKGEGEBEN',
      returnRequested: 'RÜCKGABE ANGEFORDERT',
      ongoing: 'LAUFEND'
    },
    settings: {
      title: 'Einstellungen',
      logout: 'Abmelden',
      changePassword: 'Passwort ändern',
      changePasswordDescription: 'Ändern Sie Ihr Passwort regelmäßig für die Kontosicherheit',
      currentPassword: 'Aktuelles Passwort',
      newPassword: 'Neues Passwort',
      confirmNewPassword: 'Neues Passwort bestätigen',
      savePassword: 'Passwort ändern',
      passwordChanged: 'Passwort erfolgreich geändert.',
      passwordChangeError: 'Passwort konnte nicht geändert werden. Überprüfen Sie Ihr aktuelles Passwort.',
      passwordMismatch: 'Neue Passwörter stimmen nicht überein.',
      passwordTooShort: 'Neues Passwort muss mindestens 6 Zeichen haben.',
      backupRestore: 'Sicherung & Wiederherstellung',
      backupRestoreDescription: 'Sichern Sie Ihre Daten oder stellen Sie sie aus einer vorherigen Sicherung wieder her',
      downloadBackup: 'Sicherung herunterladen',
      backupDownloaded: 'Sicherungsdatei heruntergeladen.',
      backupError: 'Sicherung konnte nicht erstellt werden.',
      selectBackupFile: 'Sicherungsdatei auswählen',
      restoreWarning: 'Die Wiederherstellung ersetzt alle vorhandenen Daten.',
      dataRestored: 'Daten erfolgreich wiederhergestellt.',
      restoreError: 'Wiederherstellung fehlgeschlagen. Überprüfen Sie das Dateiformat.',
      invalidBackupFormat: 'Ungültiges Sicherungsdateiformat. Stellen Sie sicher, dass Sie eine JSON-Datei ausgewählt haben.',
      invalidBackupSections: 'Sicherungsdatei enthält keine gültigen Datenabschnitte.',
      serverError: 'Serverfehler. Bitte versuchen Sie es später erneut.',
      appearance: 'Erscheinungsbild-Einstellungen',
      appearanceDescription: 'Schnittstellenthema und Erscheinungsoptionen festlegen',
      darkTheme: 'Dunkles Thema',
      enableDarkTheme: 'Dunkles Farbthema aktivieren',
      themeChanged: 'Thema geändert',
      lightThemeEnabled: 'Helles Thema aktiviert.',
      darkThemeEnabled: 'Dunkles Thema aktiviert.',
      autoBackup: 'Automatische Sicherung',
      autoBackupDescription: 'Ihre Daten werden automatisch gesichert',
      autoBackupEnabled: 'Automatische Sicherung',
      dailyAutoBackupActive: 'Tägliche automatische Sicherung aktiv',
      lastBackup: 'Letzte Sicherung',
      nextBackup: 'Nächste Sicherung',
      language: 'Sprache',
      languageDescription: 'Anwendungssprache auswählen',
      selectLanguage: 'Sprache auswählen',
      languageChanged: 'Sprache geändert'
    },
    languages: {
      turkish: 'Türkçe',
      english: 'English',
      german: 'Deutsch'
    },
    responsiblePersons: {
      avMSerifBey: 'Av.M.Şerif Bey',
      omerBey: 'Ömer Bey',
      avIbrahimBey: 'Av.İbrahim Bey',
      avKenanBey: 'Av.Kenan Bey',
      ismailBey: 'İsmail Bey',
      ebruHanim: 'Ebru Hanım',
      pinarHanim: 'Pınar Hanım',
      yarenHanim: 'Yaren Hanım'
    }
  }
}
