export const EMOJI_GROUPS: { title: string; items: [string, string][] }[] = [
  {
    title: 'Durum',
    items: [
      ['✅', 'Tamam'], ['☑️', 'Yapıldı'], ['✔️', 'Onay'], ['❌', 'Hayır'], ['✖️', 'İptal'], ['❗', '!'], ['‼️', 'Çok önemli'], ['❓', '?'],
      ['⚠️', 'Dikkat'], ['⛔', 'Yasak'], ['🚫', 'Engel'], ['⏳', 'Bekliyor'], ['⌛', 'Süre doldu'], ['🔄', 'Tekrar'], ['🔁', 'Yinele'], ['🆕', 'Yeni'],
      ['🆗', 'OK'], ['🔝', 'Öncelikli'], ['🔥', 'Acil'], ['💯', 'Tam'], ['⭐', 'Yıldız'], ['🌟', 'Önemli'], ['📌', 'Not'], ['📍', 'Konum'],
    ],
  },
  {
    title: 'Renk',
    items: [
      ['🔴', 'Kırmızı'], ['🟠', 'Turuncu'], ['🟡', 'Sarı'], ['🟢', 'Yeşil'], ['🔵', 'Mavi'], ['🟣', 'Mor'], ['⚫', 'Siyah'], ['⚪', 'Beyaz'],
      ['🟥', 'Kırmızı kare'], ['🟧', 'Turuncu kare'], ['🟨', 'Sarı kare'], ['🟩', 'Yeşil kare'], ['🟦', 'Mavi kare'], ['🟪', 'Mor kare'], ['⬛', 'Siyah kare'], ['⬜', 'Beyaz kare'],
    ],
  },
  {
    title: 'Takvim ve İletişim',
    items: [
      ['📅', 'Takvim'], ['📆', 'Tarih'], ['🗓️', 'Ajanda'], ['⏰', 'Alarm'], ['⏱️', 'Süre'], ['🕐', 'Saat'], ['🔔', 'Hatırlatma'], ['🔕', 'Sessiz'],
      ['📞', 'Telefon'], ['☎️', 'Sabit hat'], ['📱', 'Cep telefonu'], ['📧', 'E-posta'], ['✉️', 'Mektup'], ['📨', 'Gelen'], ['📤', 'Gönderildi'], ['📥', 'Alındı'],
      ['📮', 'Posta'], ['💬', 'Mesaj'], ['🗨️', 'Görüşme'], ['📢', 'Duyuru'], ['🤝', 'Anlaşma'], ['👤', 'Kişi'], ['👥', 'Kişiler'], ['🧑‍💼', 'Avukat'],
    ],
  },
  {
    title: 'Dosya ve Hukuk',
    items: [
      ['📄', 'Belge'], ['📃', 'Sayfa'], ['📑', 'Evrak'], ['📋', 'Liste'], ['📁', 'Dosya'], ['📂', 'Açık dosya'], ['🗂️', 'Arşiv'], ['🗃️', 'Kutu'],
      ['📎', 'Ek'], ['🖇️', 'Ekler'], ['✏️', 'Kalem'], ['🖊️', 'İmza'], ['📝', 'Not al'], ['🔍', 'İncele'], ['🔎', 'Araştır'], ['🔒', 'Kilitli'],
      ['🔓', 'Açık'], ['🔑', 'Anahtar'], ['⚖️', 'Hukuk'], ['🏛️', 'Mahkeme'], ['👨‍⚖️', 'Hakim'], ['🧾', 'Makbuz'], ['📜', 'Karar'], ['🖨️', 'Yazdır'],
    ],
  },
  {
    title: 'Para ve Mal',
    items: [
      ['💰', 'Para'], ['💵', 'Nakit'], ['💳', 'Kart'], ['🏦', 'Banka'], ['💸', 'Ödeme'], ['🪙', 'Bozuk para'], ['📈', 'Artış'], ['📉', 'Düşüş'],
      ['🧮', 'Hesap'], ['🚗', 'Araç'], ['🚚', 'Kamyon'], ['🏠', 'Ev'], ['🏢', 'Bina'], ['🏭', 'Fabrika'], ['🏗️', 'İnşaat'], ['🌾', 'Tarla'],
      ['🔨', 'Haciz'], ['🛒', 'Satış'], ['📦', 'Paket'], ['💼', 'Çanta'], ['💎', 'Değerli'], ['⚙️', 'Ayar'], ['🧰', 'Alet'], ['🎯', 'Hedef'],
    ],
  },
  {
    title: 'Yön ve Yüz',
    items: [
      ['➡️', '->'], ['⬅️', '<-'], ['⬆️', 'Yukarı'], ['⬇️', 'Aşağı'], ['↩️', 'Geri'], ['🔜', 'Yakında'], ['🔚', 'Son'], ['🔙', 'Dönüş'],
      ['👍', 'Olumlu'], ['👎', 'Olumsuz'], ['👌', 'Uygun'], ['✌️', 'Zafer'], ['👏', 'Tebrik'], ['🙏', 'Rica'], ['💪', 'Güçlü'], ['👀', 'Takip'],
      ['🙂', ':)'], ['😊', ':)'], ['😀', ':D'], ['😉', ';)'], ['😐', ':|'], ['🙁', ':('], ['😟', 'Endişe'], ['😮', 'Şaşkın'],
      ['🤔', 'Düşün'], ['😅', 'Ufff'], ['😡', 'Kızgın'], ['🎉', 'Kutlama'], ['💡', 'Fikir'], ['❤️', 'Kalp'], ['☕', 'Kahve'], ['🎂', 'Doğum günü'],
    ],
  },
]

export const EMOJI_NAMES: Record<string, string> = Object.fromEntries(
  EMOJI_GROUPS.flatMap((g) => g.items)
)
