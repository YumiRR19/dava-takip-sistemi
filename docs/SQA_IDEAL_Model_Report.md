# LexCloud Dava Takip Sistemi
## IDEAL Model Kullanarak Yazılım Kalite Güvencesi (SQA) Değerlendirmesi ve Ölçümleri

---

**Proje Adı:** LexCloud - Dava Takip Sistemi  
**Versiyon:** 1.0.0  
**Tarih:** Ocak 2026  
**Hazırlayan:** Yazılım Kalite Güvence Ekibi

---

## İçindekiler

1. [Görev 1: Yazılım Hedefi, KG Kriterleri ve Değerlendirme Teknikleri](#görev-1-yazılım-hedefi-kg-kriterleri-ve-değerlendirme-teknikleri)
2. [Görev 2: Test Planı Dokümantasyonu](#görev-2-test-planı-dokümantasyonu)
3. [Görev 3: Yansıma ve Öğrenme](#görev-3-yansıma-ve-öğrenme)
4. [Ekler](#ekler)

---

# Görev 1: Yazılım Hedefi, KG Kriterleri ve Değerlendirme Teknikleri (QP, Initiate)

## 1.1 Proje Hedef Tanımı

| Özellik | Açıklama |
|---------|----------|
| **Proje Hedefi** | Hukuk bürolarının dava dosyalarını, icra takiplerini, teminat mektuplarını ve müvekkil bilgilerini etkin bir şekilde yönetmelerini sağlayan güvenilir ve kapsamlı bir Dava Takip Sistemi (LexCloud) geliştirmek. |
| **Alan (Domain)** | Hukuk Teknolojisi (Legal Tech) - Avukatlık Bürosu Yönetim Sistemi |
| **Senaryo** | Avukatlar dava dosyalarını oluşturur ve takip eder, icra takiplerini yönetir, teminat mektuplarını izler, müvekkil bilgilerini günceller ve hatırlatma sistemini kullanarak önemli tarihleri takip eder. |
| **Kullanıcı Gereksinimleri** | - Güvenli giriş sistemi (JWT tabanlı kimlik doğrulama)<br>- Dava dosyası oluşturma, düzenleme ve silme<br>- İcra takibi yönetimi<br>- Teminat mektubu takibi<br>- Müvekkil yönetimi<br>- Hatırlatma sistemi<br>- Gerçek zamanlı veri senkronizasyonu (WebSocket)<br>- Yedekleme ve geri yükleme<br>- Responsive tasarım |

## 1.2 Sistem Mimarisi ve Bileşenleri

LexCloud sistemi modern bir fullstack mimari kullanmaktadır:

### Backend Bileşenleri
- **Framework:** FastAPI (Python)
- **Veritabanı:** PostgreSQL
- **Kimlik Doğrulama:** JWT (JSON Web Token)
- **Gerçek Zamanlı İletişim:** WebSocket
- **ORM:** SQLAlchemy

### Frontend Bileşenleri
- **Framework:** React + TypeScript
- **Build Tool:** Vite
- **UI Kütüphanesi:** shadcn/ui
- **Stil:** Tailwind CSS
- **State Yönetimi:** React Context API

### Veritabanı Şeması

| Tablo | Açıklama | Temel Alanlar |
|-------|----------|---------------|
| **clients** | Müvekkil bilgileri | id, name, email, phone, address, tax_id, vekalet_ofis_no |
| **cases** | Dava dosyaları | id, title, case_name, client_id, case_type, status, court, case_number, defendant, reminder_date |
| **executions** | İcra takipleri | id, client_id, defendant, execution_office, execution_number, status, haciz_durumu |
| **compensation_letters** | Teminat mektupları | id, client_id, letter_number, bank, customer, court, case_number, status |

## 1.3 Kalite Güvence Kriterleri

| KG Kriteri | Değerlendirme Tekniği | Açıklama |
|------------|----------------------|----------|
| **Güvenilirlik (Reliability)** | Stres testi, çalışma zamanı izleme | Sistemin kesintisiz çalışması, veri bütünlüğünün korunması |
| **Kullanılabilirlik (Usability)** | Kullanıcı kabul testi (UAT), anketler | Kullanıcı dostu arayüz, kolay navigasyon |
| **Performans (Performance)** | Yük testi, yanıt süresi ölçümü | API yanıt süreleri < 500ms, sayfa yükleme < 3s |
| **Güvenlik (Security)** | Penetrasyon testi, kimlik doğrulama kontrolleri | JWT tabanlı güvenli oturum, şifreli veri iletimi |
| **Bakım Yapılabilirlik (Maintainability)** | Kod incelemeleri, modüler tasarım denetimleri | Temiz kod yapısı, modüler mimari |
| **Ölçeklenebilirlik (Scalability)** | Yük testi, veritabanı performans analizi | Artan kullanıcı ve veri yüküne uyum |

### Güvenlik Planı: Rol Tabanlı Erişim Kontrolü (RBAC)

Sistem şu anda tek seviyeli kimlik doğrulama kullanmaktadır. Gelecek sürümlerde aşağıdaki güvenlik önlemleri planlanmaktadır:

1. **Kullanıcı Kimlik Doğrulama:** JWT tabanlı token sistemi (mevcut)
2. **Yetkilendirme:** Rol tabanlı erişim kontrolü (planlanan)
3. **Derinlemesine Savunma (DiD):** Çok katmanlı güvenlik yaklaşımı

## 1.4 İş Akışı Diyagramı (Use Case Aktiviteleri)

### Ana Kullanım Senaryoları

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LexCloud Dava Takip Sistemi                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐                                                               │
│  │ Kullanıcı│                                                               │
│  └────┬─────┘                                                               │
│       │                                                                     │
│       ▼                                                                     │
│  ┌──────────┐     ┌─────────────┐     ┌─────────────────┐                  │
│  │  Giriş   │────▶│  Dashboard  │────▶│  Hatırlatmalar  │                  │
│  │  (Login) │     │  (Anasayfa) │     │  Görüntüleme    │                  │
│  └──────────┘     └──────┬──────┘     └─────────────────┘                  │
│                          │                                                  │
│       ┌──────────────────┼──────────────────┬───────────────────┐          │
│       ▼                  ▼                  ▼                   ▼          │
│  ┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────┐      │
│  │ Müvekkil │     │   Dava   │     │    İcra      │     │ Teminat  │      │
│  │ Yönetimi │     │ Dosyaları│     │  Takipleri   │     │ Mektupları│      │
│  └────┬─────┘     └────┬─────┘     └──────┬───────┘     └────┬─────┘      │
│       │                │                  │                   │            │
│       ▼                ▼                  ▼                   ▼            │
│  ┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────┐      │
│  │  CRUD    │     │  CRUD    │     │    CRUD      │     │  CRUD    │      │
│  │ İşlemleri│     │ İşlemleri│     │  İşlemleri   │     │ İşlemleri│      │
│  └──────────┘     └──────────┘     └──────────────┘     └──────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Detaylı UML Use Case Diyagramı

```
                              ┌─────────────────────────────────────┐
                              │           LexCloud Sistemi          │
                              └─────────────────────────────────────┘
                                              │
            ┌─────────────────────────────────┼─────────────────────────────────┐
            │                                 │                                 │
            ▼                                 ▼                                 ▼
    ┌───────────────┐               ┌───────────────┐               ┌───────────────┐
    │   Kimlik      │               │   Veri        │               │   Sistem      │
    │   Doğrulama   │               │   Yönetimi    │               │   Yönetimi    │
    └───────────────┘               └───────────────┘               └───────────────┘
            │                                 │                                 │
    ┌───────┴───────┐         ┌───────────────┼───────────────┐         ┌───────┴───────┐
    │               │         │               │               │         │               │
    ▼               ▼         ▼               ▼               ▼         ▼               ▼
┌───────┐     ┌───────┐   ┌───────┐     ┌───────┐     ┌───────┐   ┌───────┐     ┌───────┐
│ Giriş │     │ Çıkış │   │Müvekkil│    │ Dava  │     │ İcra  │   │Yedekle│     │ Geri  │
│       │     │       │   │        │    │       │     │       │   │       │     │ Yükle │
└───────┘     └───────┘   └───────┘     └───────┘     └───────┘   └───────┘     └───────┘
```

### Sonlu Durum Makinesi (FSM) - Dava Durumu

```
                    ┌─────────────────────────────────────────────────────────────┐
                    │                    DAVA DURUM GEÇİŞLERİ                     │
                    └─────────────────────────────────────────────────────────────┘

    ┌─────────┐                                                         ┌─────────┐
    │ Derdest │◀────────────────────────────────────────────────────────│  Yeni   │
    │         │                                                         │  Dava   │
    └────┬────┘                                                         └─────────┘
         │
         ├──────────────┬──────────────┬──────────────┬──────────────┐
         ▼              ▼              ▼              ▼              ▼
    ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
    │ Beraat  │   │  Kabul  │   │   Red   │   │  Ceza   │   │Bilirkişi│
    └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘
         │              │              │              │              │
         └──────────────┴──────────────┼──────────────┴──────────────┘
                                       ▼
                                 ┌─────────┐
                                 │ Temyiz  │
                                 │/İstinaf │
                                 └────┬────┘
                                      │
                                      ▼
                              ┌──────────────┐
                              │Kesinleştirme │
                              └──────────────┘
```

---

# Görev 2: Test Planı Dokümantasyonu (QA Initiate, Diagnose, Establish, Act)

## 2.1 Gereksinim Analizi ve Tanımı

### 2.1.1 Fonksiyonel Gereksinimler

| ID | Gereksinim | Modül | Öncelik |
|----|------------|-------|---------|
| FR-001 | Kullanıcı şifre ile sisteme giriş yapabilmeli | Kimlik Doğrulama | Yüksek |
| FR-002 | Kullanıcı yeni müvekkil ekleyebilmeli | Müvekkil Yönetimi | Yüksek |
| FR-003 | Kullanıcı müvekkil bilgilerini güncelleyebilmeli | Müvekkil Yönetimi | Yüksek |
| FR-004 | Kullanıcı müvekkil silebilmeli | Müvekkil Yönetimi | Orta |
| FR-005 | Kullanıcı yeni dava dosyası oluşturabilmeli | Dava Yönetimi | Yüksek |
| FR-006 | Kullanıcı dava dosyasını güncelleyebilmeli | Dava Yönetimi | Yüksek |
| FR-007 | Kullanıcı dava dosyasını silebilmeli | Dava Yönetimi | Orta |
| FR-008 | Kullanıcı davaları filtreleyebilmeli | Dava Yönetimi | Orta |
| FR-009 | Kullanıcı yeni icra takibi ekleyebilmeli | İcra Yönetimi | Yüksek |
| FR-010 | Kullanıcı icra takibini güncelleyebilmeli | İcra Yönetimi | Yüksek |
| FR-011 | Kullanıcı teminat mektubu ekleyebilmeli | Teminat Yönetimi | Yüksek |
| FR-012 | Kullanıcı hatırlatmaları görüntüleyebilmeli | Dashboard | Yüksek |
| FR-013 | Kullanıcı verileri yedekleyebilmeli | Sistem Yönetimi | Orta |
| FR-014 | Kullanıcı yedekten geri yükleyebilmeli | Sistem Yönetimi | Orta |

### 2.1.2 Fonksiyonel Olmayan Gereksinimler

| ID | Gereksinim | Kategori | Ölçüm Kriteri |
|----|------------|----------|---------------|
| NFR-001 | API yanıt süresi 500ms'den az olmalı | Performans | Ortalama yanıt süresi < 500ms |
| NFR-002 | Sayfa yükleme süresi 3 saniyeden az olmalı | Performans | İlk yükleme < 3s |
| NFR-003 | Sistem %99.9 uptime sağlamalı | Güvenilirlik | Aylık kesinti < 43 dakika |
| NFR-004 | JWT token 24 saat geçerli olmalı | Güvenlik | Token süresi = 24 saat |
| NFR-005 | Şifreler güvenli şekilde saklanmalı | Güvenlik | Şifre hash'leme |
| NFR-006 | WebSocket bağlantısı 25 saniyede ping atmalı | Performans | Ping aralığı = 25s |
| NFR-007 | Veritabanı bağlantı havuzu 5-15 bağlantı | Performans | pool_size=5, max_overflow=10 |
| NFR-008 | GZip sıkıştırma 1000 byte üzeri için aktif | Performans | minimum_size=1000 |

### 2.1.3 Hata ve Kusur Ölçümleri

<span style="color: red;">**HATA KATEGORİLERİ VE ÖNCELİKLERİ:**</span>

| Hata Tipi | Açıklama | Öncelik | Çözüm Süresi |
|-----------|----------|---------|--------------|
| <span style="color: red;">**Kritik (P1)**</span> | Sistem çökmesi, veri kaybı | Acil | < 4 saat |
| <span style="color: red;">**Yüksek (P2)**</span> | Ana fonksiyon çalışmıyor | Yüksek | < 24 saat |
| <span style="color: red;">**Orta (P3)**</span> | Fonksiyon kısmen çalışıyor | Orta | < 72 saat |
| <span style="color: red;">**Düşük (P4)**</span> | Kozmetik hatalar | Düşük | Sonraki sürüm |

<span style="color: red;">**NORMAL VE ANORMAL ÇALIŞMA ZAMANI AYIRIMI:**</span>

| Durum | Normal Davranış | <span style="color: red;">Anormal Davranış</span> |
|-------|-----------------|---------------------------------------------------|
| API Yanıtı | 200 OK, JSON veri | <span style="color: red;">500 Internal Server Error</span> |
| Veritabanı | Bağlantı başarılı | <span style="color: red;">Connection timeout</span> |
| WebSocket | Bağlı durumda | <span style="color: red;">Bağlantı kopuk, polling moduna geçiş</span> |
| Kimlik Doğrulama | Token geçerli | <span style="color: red;">401 Unauthorized, token expired</span> |
| Form Gönderimi | Veri kaydedildi | <span style="color: red;">Validation error, IntegrityError</span> |

## 2.2 Tasarım ve Geliştirme Kontrol Listesi (QC Initiate, Diagnose, Establish)

### 2.2.1 Modül Bazlı Denetim ve Test Kontrol Listesi

| Aktivite | Denetim/Test | Sürüm Durumu | KK Uygulaması |
|----------|--------------|--------------|---------------|
| **Giriş Modülü** | Güvenli kimlik doğrulama kontrolü | Aktif | JWT token doğrulama, şifre kontrolü |
| **Müvekkil Kaydı** | Veri doğrulama, benzersizlik kontrolü | Aktif | Email/telefon format kontrolü |
| **Dava Oluşturma** | Zorunlu alan kontrolü, müvekkil ilişkisi | Aktif | client_id foreign key kontrolü |
| **İcra Takibi** | Durum geçişleri, tarih doğrulama | Aktif | Status enum kontrolü |
| **Teminat Mektubu** | Banka ve müşteri bilgi doğrulama | Aktif | Zorunlu alan kontrolü |
| **Dashboard** | Veri toplama, hatırlatma filtreleme | Aktif | Tarih bazlı filtreleme |
| **Yedekleme** | Veri bütünlüğü, format kontrolü | Aktif | JSON schema doğrulama |

### 2.2.2 Backend API Endpoint Test Listesi

| Endpoint | Metod | Test Senaryosu | Beklenen Sonuç |
|----------|-------|----------------|----------------|
| `/api/login` | POST | Doğru şifre ile giriş | 200 OK, JWT token |
| `/api/login` | POST | Yanlış şifre ile giriş | <span style="color: red;">401 Unauthorized</span> |
| `/api/clients` | GET | Tüm müvekkilleri listele | 200 OK, Client[] |
| `/api/clients` | POST | Yeni müvekkil ekle | 201 Created |
| `/api/clients/{id}` | PUT | Müvekkil güncelle | 200 OK |
| `/api/clients/{id}` | DELETE | Müvekkil sil | 200 OK |
| `/api/cases` | GET | Davaları listele | 200 OK, Case[] |
| `/api/cases` | POST | Yeni dava ekle | 201 Created |
| `/api/cases/{id}` | PUT | Dava güncelle | 200 OK |
| `/api/cases/{id}` | DELETE | Dava sil | 200 OK |
| `/api/executions` | GET | İcra takiplerini listele | 200 OK |
| `/api/compensation-letters` | GET | Teminat mektuplarını listele | 200 OK |
| `/api/dashboard` | GET | Dashboard verilerini al | 200 OK |
| `/api/backup` | GET | Yedek al | 200 OK, JSON |
| `/api/restore` | POST | Yedekten geri yükle | 200 OK |
| `/healthz` | GET | Sağlık kontrolü | 200 OK |
| `/health/db` | GET | Veritabanı sağlık kontrolü | 200 OK |
| `/health/ws` | GET | WebSocket sağlık kontrolü | 200 OK |

### 2.2.3 Frontend Bileşen Test Listesi

| Bileşen | Test Tipi | Test Senaryosu | Durum |
|---------|-----------|----------------|-------|
| Login.tsx | Unit Test | Şifre girişi ve form gönderimi | Aktif |
| Dashboard.tsx | Integration Test | Veri yükleme ve görüntüleme | Aktif |
| Cases.tsx | Unit Test | Filtreleme ve arama | Aktif |
| CaseForm.tsx | Unit Test | Form doğrulama, müvekkil seçimi | Aktif |
| Clients.tsx | Unit Test | CRUD işlemleri | Aktif |
| Executions.tsx | Unit Test | İcra listesi görüntüleme | Aktif |
| CompensationLetters.tsx | Unit Test | Teminat mektubu yönetimi | Aktif |

## 2.3 Test ve Sürüm Metrikleri (QC Initiate, Diagnose, Establish, Act)

### 2.3.1 Performans Metrikleri

| Metrik | Ölçüm | Hedef | Mevcut Durum |
|--------|-------|-------|--------------|
| **Zamanlama (Timing)** | Login API yanıt süresi | < 200ms | Ölçülecek |
| **Zamanlama (Timing)** | Dava listesi yükleme | < 500ms | Ölçülecek |
| **Zamanlama (Timing)** | Dashboard veri yükleme | < 1000ms | Ölçülecek |
| **Frekans (Frequency)** | WebSocket ping aralığı | 25 saniye | 25 saniye |
| **Frekans (Frequency)** | Token yenileme | 24 saat | 24 saat |
| **Frekans (Frequency)** | Veritabanı bağlantı havuzu yenileme | 3600 saniye | 3600 saniye |

### 2.3.2 Hata Oranı Metrikleri

| Metrik | Ölçüm Yöntemi | <span style="color: red;">Hata Eşiği</span> |
|--------|---------------|---------------------------------------------|
| **API Hata Oranı** | 4xx/5xx yanıt sayısı / toplam istek | <span style="color: red;">< %1</span> |
| **Frontend Hata Oranı** | Console error sayısı / oturum | <span style="color: red;">< 5 hata/oturum</span> |
| **Veritabanı Hata Oranı** | Başarısız sorgu / toplam sorgu | <span style="color: red;">< %0.1</span> |
| **WebSocket Kopma Oranı** | Kopma sayısı / bağlantı süresi | <span style="color: red;">< 1 kopma/saat</span> |

### 2.3.3 Kod Kalite Metrikleri

| Metrik | Açıklama | Hedef |
|--------|----------|-------|
| **Test Kapsama Oranı** | Birim testlerin kod kapsamı | > %70 |
| **Kod Tekrarı** | Tekrarlanan kod bloğu oranı | < %5 |
| **Karmaşıklık** | Cyclomatic complexity | < 10 |
| **Bağımlılık Sayısı** | Harici paket sayısı | Minimize |

## 2.4 IDEAL Model Uygulama Aşamaları

### 2.4.1 Initiating (Başlatma) Aşaması

Bu aşamada proje hedefleri belirlendi ve kalite güvence altyapısı kuruldu:

1. **Proje Kapsamı Tanımlandı:** LexCloud dava takip sistemi için fonksiyonel ve fonksiyonel olmayan gereksinimler belirlendi.
2. **Kalite Hedefleri Belirlendi:** Güvenilirlik, performans, güvenlik ve kullanılabilirlik kriterleri tanımlandı.
3. **Paydaş Analizi Yapıldı:** Avukatlar, hukuk bürosu çalışanları ve sistem yöneticileri olarak belirlendi.
4. **Kaynak Planlaması:** Test ortamı, araçlar ve personel planlandı.

### 2.4.2 Diagnosing (Teşhis) Aşaması

Mevcut sistemin analizi ve iyileştirme alanlarının belirlenmesi:

1. **Mevcut Durum Analizi:**
   - Backend: FastAPI + PostgreSQL mimarisi incelendi
   - Frontend: React + TypeScript + Tailwind CSS yapısı değerlendirildi
   - Mevcut test kapsamı: Backend ve frontend testleri mevcut

2. **Boşluk Analizi:**
   - <span style="color: red;">**Eksiklik:** Entegrasyon testleri yetersiz</span>
   - <span style="color: red;">**Eksiklik:** Performans testleri yapılmamış</span>
   - <span style="color: red;">**Eksiklik:** Güvenlik testleri eksik</span>

3. **Risk Değerlendirmesi:**
   - Veri kaybı riski: Orta (yedekleme sistemi mevcut)
   - Güvenlik riski: Düşük (JWT implementasyonu mevcut)
   - Performans riski: Belirsiz (test edilmemiş)

### 2.4.3 Establishing (Kurma) Aşaması

Kalite güvence süreçlerinin ve standartlarının oluşturulması:

1. **Test Stratejisi:**
   - Birim testler: Jest (Frontend), Pytest (Backend)
   - Entegrasyon testleri: API endpoint testleri
   - Kabul testleri: Kullanıcı senaryoları

2. **Kod İnceleme Süreci:**
   - Pull request zorunluluğu
   - En az 1 onay gereksinimi
   - CI/CD pipeline kontrolü

3. **Dokümantasyon Standartları:**
   - API dokümantasyonu (FastAPI otomatik)
   - Kod yorumları
   - README dosyaları

### 2.4.4 Acting (Uygulama) Aşaması

Belirlenen süreçlerin uygulanması:

1. **Test Yürütme:**
   ```bash
   # Backend testleri
   cd backend && poetry run pytest
   
   # Frontend testleri
   cd frontend && npm test
   ```

2. **Sürekli Entegrasyon:**
   - Her commit'te otomatik test çalıştırma
   - Lint kontrolü
   - Build doğrulama

3. **Hata Takibi:**
   - GitHub Issues kullanımı
   - Öncelik ve kategori etiketleme
   - Sprint bazlı çözüm planlaması

### 2.4.5 Learning (Öğrenme) Aşaması

Süreç iyileştirme ve bilgi paylaşımı:

1. **Retrospektif Toplantılar:**
   - Sprint sonunda değerlendirme
   - İyileştirme önerilerinin toplanması

2. **Metrik Analizi:**
   - Hata trendlerinin incelenmesi
   - Performans verilerinin değerlendirilmesi

3. **Bilgi Tabanı:**
   - Çözülen sorunların dokümantasyonu
   - En iyi uygulamaların paylaşımı

---

# Görev 3: Yansıma ve Öğrenme (Learning Phase)

## 3.1 Use Case Modelleme Değerlendirmesi

### Olumlu Noktalar
- Use case modelleme, sistem gereksinimlerini netleştirdi
- Kullanıcı senaryoları açıkça tanımlandı
- Modüler yapı sayesinde bağımsız geliştirme mümkün oldu

### İyileştirme Alanları
- Daha detaylı kullanıcı hikayeleri yazılabilir
- Edge case'ler için ek senaryolar eklenebilir

## 3.2 Geliştirme Süreci Değerlendirmesi

### Olumlu Noktalar
- Modern teknoloji stack'i kullanıldı (FastAPI, React, TypeScript)
- Gerçek zamanlı senkronizasyon (WebSocket) implementasyonu başarılı
- Responsive tasarım ile mobil uyumluluk sağlandı

### İyileştirme Alanları
- <span style="color: red;">Performans izleme araçları entegre edilmeli</span>
- <span style="color: red;">Kullanıcı geri bildirimi tasarım aşamasında daha erken alınmalı</span>
- <span style="color: red;">Otomatik test kapsamı artırılmalı</span>

## 3.3 Kalite Güvence Değerlendirmesi

### Başarılar
- KG kriterleri sistematik test sürecini sağladı
- Hata kategorilendirmesi önceliklendirmeyi kolaylaştırdı
- IDEAL model yapılandırılmış bir yaklaşım sundu

### Zorluklar
- <span style="color: red;">Entegrasyon testlerinin yazılması zaman aldı</span>
- <span style="color: red;">Performans test ortamının kurulumu karmaşıktı</span>

## 3.4 Öğrenilen Dersler

| Alan | Öğrenilen Ders | Aksiyon |
|------|----------------|---------|
| Gereksinim | Erken paydaş katılımı kritik | Proje başında workshop düzenle |
| Tasarım | Modüler mimari esneklik sağlar | Bileşen bazlı geliştirmeye devam |
| Test | Otomatik testler zaman kazandırır | CI/CD pipeline'ı güçlendir |
| Dağıtım | Aşamalı dağıtım riski azaltır | Staging ortamı kullan |
| İzleme | Proaktif izleme sorunları önler | APM araçları entegre et |

## 3.5 Sonraki Adımlar ve Öneriler

1. **Kısa Vadeli (1-2 Hafta):**
   - Mevcut test kapsamını %80'e çıkar
   - Performans baseline ölçümlerini tamamla
   - Güvenlik taraması yap

2. **Orta Vadeli (1-2 Ay):**
   - Rol tabanlı erişim kontrolü ekle
   - Raporlama modülü geliştir
   - Mobil uygulama planla

3. **Uzun Vadeli (3-6 Ay):**
   - Çoklu dil desteği ekle
   - Entegrasyon API'leri geliştir
   - Yapay zeka destekli öneriler ekle

---

# Ekler

## Ek A: Veritabanı Şema Diyagramı

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              VERİTABANI ŞEMASI                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐         ┌─────────────────────┐
│      clients        │         │       cases         │
├─────────────────────┤         ├─────────────────────┤
│ id (PK)             │◀────────│ client_id (FK)      │
│ name                │         │ id (PK)             │
│ email               │         │ title               │
│ phone               │         │ case_name           │
│ address             │         │ description         │
│ tax_id              │         │ case_type           │
│ vekalet_ofis_no     │         │ status              │
│ created_at          │         │ court               │
│ updated_at          │         │ case_number         │
│ version             │         │ defendant           │
│ is_deleted          │         │ notes               │
└─────────────────────┘         │ start_date          │
         │                      │ next_hearing_date   │
         │                      │ reminder_date       │
         │                      │ office_archive_no   │
         │                      │ responsible_person  │
         │                      │ görevlendiren       │
         │                      │ created_at          │
         │                      │ updated_at          │
         │                      │ version             │
         │                      │ is_deleted          │
         │                      └─────────────────────┘
         │
         │                      ┌─────────────────────┐
         │                      │    executions       │
         │                      ├─────────────────────┤
         └─────────────────────▶│ client_id (FK)      │
                                │ id (PK)             │
                                │ defendant           │
                                │ execution_office    │
                                │ execution_number    │
                                │ status              │
                                │ execution_type      │
                                │ start_date          │
                                │ office_archive_no   │
                                │ reminder_date       │
                                │ reminder_text       │
                                │ notes               │
                                │ haciz_durumu        │
                                │ responsible_person  │
                                │ görevlendiren       │
                                │ created_at          │
                                │ updated_at          │
                                │ version             │
                                │ is_deleted          │
                                └─────────────────────┘

         │                      ┌─────────────────────────┐
         │                      │  compensation_letters   │
         │                      ├─────────────────────────┤
         └─────────────────────▶│ client_id (FK)          │
                                │ id (PK)                 │
                                │ title                   │
                                │ letter_number           │
                                │ bank                    │
                                │ customer_number         │
                                │ customer                │
                                │ court                   │
                                │ case_number             │
                                │ status                  │
                                │ description_text        │
                                │ reminder_date           │
                                │ reminder_text           │
                                │ responsible_person      │
                                │ görevlendiren           │
                                │ created_at              │
                                │ updated_at              │
                                │ version                 │
                                │ is_deleted              │
                                └─────────────────────────┘
```

## Ek B: API Endpoint Listesi

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/healthz` | GET | Sistem sağlık kontrolü |
| `/health/db` | GET | Veritabanı sağlık kontrolü |
| `/health/ws` | GET | WebSocket sağlık kontrolü |
| `/api/login` | POST | Kullanıcı girişi |
| `/api/logout` | POST | Kullanıcı çıkışı |
| `/api/clients` | GET, POST | Müvekkil listesi ve ekleme |
| `/api/clients/{id}` | GET, PUT, DELETE | Müvekkil detay işlemleri |
| `/api/cases` | GET, POST | Dava listesi ve ekleme |
| `/api/cases/{id}` | GET, PUT, DELETE | Dava detay işlemleri |
| `/api/cases/search` | GET | Dava arama |
| `/api/executions` | GET, POST | İcra listesi ve ekleme |
| `/api/executions/{id}` | GET, PUT, DELETE | İcra detay işlemleri |
| `/api/compensation-letters` | GET, POST | Teminat mektubu listesi ve ekleme |
| `/api/compensation-letters/{id}` | GET, PUT, DELETE | Teminat mektubu detay işlemleri |
| `/api/dashboard` | GET | Dashboard verileri |
| `/api/backup` | GET | Veri yedekleme |
| `/api/restore` | POST | Veri geri yükleme |
| `/ws/{token}` | WebSocket | Gerçek zamanlı veri senkronizasyonu |

## Ek C: Test Senaryoları

### C.1 Kimlik Doğrulama Test Senaryoları

| ID | Senaryo | Girdi | Beklenen Çıktı |
|----|---------|-------|----------------|
| TC-001 | Başarılı giriş | Doğru şifre | JWT token döner |
| TC-002 | Başarısız giriş | Yanlış şifre | <span style="color: red;">401 Unauthorized</span> |
| TC-003 | Token süresi dolmuş | Expired token | <span style="color: red;">401 Token expired</span> |
| TC-004 | Geçersiz token | Invalid token | <span style="color: red;">401 Invalid token</span> |

### C.2 Müvekkil Yönetimi Test Senaryoları

| ID | Senaryo | Girdi | Beklenen Çıktı |
|----|---------|-------|----------------|
| TC-005 | Müvekkil ekleme | Geçerli veri | 201 Created |
| TC-006 | Eksik alan ile ekleme | name boş | <span style="color: red;">422 Validation Error</span> |
| TC-007 | Müvekkil güncelleme | Geçerli veri | 200 OK |
| TC-008 | Müvekkil silme | Geçerli ID | 200 OK |
| TC-009 | Olmayan müvekkil silme | Geçersiz ID | <span style="color: red;">404 Not Found</span> |

### C.3 Dava Yönetimi Test Senaryoları

| ID | Senaryo | Girdi | Beklenen Çıktı |
|----|---------|-------|----------------|
| TC-010 | Dava ekleme | Geçerli veri | 201 Created |
| TC-011 | Olmayan müvekkil ile dava | Geçersiz client_id | <span style="color: red;">404 Client not found</span> |
| TC-012 | Dava filtreleme | status=Derdest | Filtrelenmiş liste |
| TC-013 | Dava arama | query=test | Arama sonuçları |

## Ek D: Performans Test Sonuçları Şablonu

| Test | Metrik | Hedef | Sonuç | Durum |
|------|--------|-------|-------|-------|
| Login API | Yanıt süresi | < 200ms | - | Bekliyor |
| Dava listesi | Yanıt süresi | < 500ms | - | Bekliyor |
| Dashboard | Yükleme süresi | < 1000ms | - | Bekliyor |
| WebSocket | Bağlantı süresi | < 100ms | - | Bekliyor |
| Yedekleme | İşlem süresi | < 5000ms | - | Bekliyor |

---

**Doküman Sonu**

*Bu doküman LexCloud Dava Takip Sistemi için IDEAL Model kullanılarak hazırlanmış Yazılım Kalite Güvencesi (SQA) değerlendirme raporudur.*
