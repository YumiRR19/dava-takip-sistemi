export const CASE_STATUS_OPTIONS = [
  'Beraat',
  'Ceza',
  'Kısmen kabul Kısmen red',
  'Kabul',
  'Red',
  'Derdest',
  'Kesinleştirme',
  'Bilirkişi',
  'Konkordato',
  'Derdest/Bilirkişi',
  'Derdest/Gerekçeli Karar Bekleniyor',
  'İşlemden kaldırma',
  'Karar Verilmesine Yer Olmadığına',
  'Açılmamış Sayılma',
  'Yetkisizlik Kararı',
  'Görevsizlik Kararı',
]

// Older spellings of renamed statuses, mapped to the current option value.
export const LEGACY_CASE_STATUS_ALIASES: Record<string, string> = {
  'Derdest/Gerekli Karar Bekleniyor': 'Derdest/Gerekçeli Karar Bekleniyor',
  'Karar verilmesine yer olmadığına karar verilmiştir': 'Karar Verilmesine Yer Olmadığına',
  'Kısmen Kabul Kısmen Red': 'Kısmen kabul Kısmen red',
  'Açıklanmamış Sayılma': 'Açılmamış Sayılma',
}

export const KANUN_YOLU_OPTIONS = ['İstinaf', 'Temyiz']

export const toTurkishUpper = (value: string) => value.toLocaleUpperCase('tr-TR')

export const normalizeCaseStatus = (status: string) => LEGACY_CASE_STATUS_ALIASES[status] ?? status
