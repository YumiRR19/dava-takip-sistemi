import jsPDF from 'jspdf'
import type { DashboardData } from '@/types'
import { EMOJI_NAMES } from '@/lib/emojis'

export type DashboardReminder = DashboardData['upcoming_reminders'][number]

export const REMINDER_TYPE_LABELS: Record<DashboardReminder['type'], string> = {
  case: 'Dava Hatırlatması',
  execution: 'İcra İşlem Hatırlatması',
  haciz_koruma_reminder: 'Haciz Koruma Hatırlatması',
  mk_reminder: 'M.K Hatırlatması',
  haciz_reminder: 'M.K / Haciz Koruma (Eski Ortak) Hatırlatması',
  compensation_letter: 'Teminat Mektubu Hatırlatması',
  important_reminder: 'Önemli Hatırlatma',
}

const TYPE_ORDER: DashboardReminder['type'][] = [
  'case', 'execution', 'haciz_koruma_reminder', 'mk_reminder', 'haciz_reminder', 'compensation_letter', 'important_reminder',
]

const EMOJI_TEXT: Record<string, string> = Object.fromEntries(
  Object.entries(EMOJI_NAMES).map(([emoji, name]) => [emoji, /^[\p{L}]/u.test(name) ? `[${name}]` : name])
)

// The embedded font has no color-emoji glyphs; picker emojis become readable words, other emojis are dropped.
function toPdfText(value: string): string {
  let out = value
  for (const [emoji, text] of Object.entries(EMOJI_TEXT).sort((x, y) => y[0].length - x[0].length)) {
    out = out.split(emoji).join(text)
    const bare = emoji.replace('\uFE0F', '')
    if (bare !== emoji) out = out.split(bare).join(text)
  }
  return out.replace(/[\u{1F000}-\u{1FFFF}]|[\u2600-\u27BF]|[\u2B00-\u2BFF]|\uFE0F|\u200D/gu, '')
}

let fontPromise: Promise<{ regular: string; bold: string }> | null = null

async function fetchBase64(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Font yüklenemedi: ${url}`)
  const bytes = new Uint8Array(await res.arrayBuffer())
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}

function loadFonts() {
  if (!fontPromise) {
    fontPromise = Promise.all([fetchBase64('/fonts/DejaVuSans.ttf'), fetchBase64('/fonts/DejaVuSans-Bold.ttf')])
      .then(([regular, bold]) => ({ regular, bold }))
      .catch((err) => {
        fontPromise = null
        throw err
      })
  }
  return fontPromise
}

function fileNumberOf(r: DashboardReminder): string {
  if (r.type === 'case') return [r.case_number, r.court].filter(Boolean).join(' - ')
  if (r.type === 'compensation_letter') {
    return [r.letter_number && `Mektup No: ${r.letter_number}`, r.case_number && `Dosya No: ${r.case_number}`, r.court]
      .filter(Boolean).join(' - ')
  }
  if (r.type === 'important_reminder') return ''
  return [r.execution_number, r.execution_office].filter(Boolean).join(' - ')
}

function textOf(r: DashboardReminder): string {
  return (r.type === 'case' ? r.description : r.reminder_text) || ''
}

function timeOf(r: DashboardReminder): string {
  const raw = (r as { reminder_time?: string | null }).reminder_time
  return raw ? String(raw) : ''
}

export function sortRemindersForPdf(reminders: DashboardReminder[]): DashboardReminder[] {
  return [...reminders].sort((a, b) => {
    const t = TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
    if (t !== 0) return t
    return fileNumberOf(a).localeCompare(fileNumberOf(b), 'tr')
  })
}

export async function saveDailyRemindersPdf(options: { date: string; person: string; reminders: DashboardReminder[] }) {
  const { date, person } = options
  const reminders = sortRemindersForPdf(options.reminders)
  const fonts = await loadFonts()
  const doc = new jsPDF('p', 'mm', 'a4')
  doc.addFileToVFS('DejaVuSans.ttf', fonts.regular)
  doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal')
  doc.addFileToVFS('DejaVuSans-Bold.ttf', fonts.bold)
  doc.addFont('DejaVuSans-Bold.ttf', 'DejaVuSans', 'bold')

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  const bottomLimit = pageHeight - 18
  let y = margin + 5

  const ensureSpace = (needed: number) => {
    if (y + needed > bottomLimit) {
      doc.addPage()
      y = margin + 5
    }
  }
  const writeLines = (text: string, size: number, style: 'normal' | 'bold', indent = 0, lineHeight = size * 0.45) => {
    doc.setFont('DejaVuSans', style)
    doc.setFontSize(size)
    const lines: string[] = doc.splitTextToSize(toPdfText(text), contentWidth - indent)
    for (const line of lines) {
      ensureSpace(lineHeight)
      doc.text(line, margin + indent, y)
      y += lineHeight
    }
  }

  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', weekday: 'long' })
  writeLines('Günlük Hatırlatmalar', 18, 'bold', 0, 9)
  writeLines(`Tarih: ${dateLabel}`, 11, 'normal', 0, 6)
  writeLines(`Kişi: ${person}`, 11, 'normal', 0, 6)
  writeLines(`Toplam hatırlatma: ${reminders.length}`, 11, 'bold', 0, 6)
  y += 2
  doc.setDrawColor(120)
  doc.line(margin, y, pageWidth - margin, y)
  y += 7

  if (reminders.length === 0) {
    writeLines('Bu tarih ve kişi için hatırlatma bulunmuyor.', 11, 'normal')
  }

  reminders.forEach((r, index) => {
    ensureSpace(16)
    const time = timeOf(r)
    writeLines(`${index + 1}. ${REMINDER_TYPE_LABELS[r.type] ?? r.type}${time ? ` - Saat: ${time}` : ''}`, 11, 'bold', 0, 5.5)
    const fileNo = fileNumberOf(r)
    if (fileNo) writeLines(`Dosya No: ${fileNo}`, 10, 'normal', 5, 5)
    const parties = [r.client_name, r.defendant].filter(Boolean).join(' / ')
    if (parties) writeLines(`Taraflar: ${parties}`, 10, 'normal', 5, 5)
    if (r.görevlendiren) writeLines(`Görevlendiren: ${r.görevlendiren}`, 10, 'normal', 5, 5)
    const body = textOf(r)
    writeLines('Hatırlatma:', 10, 'bold', 5, 5)
    for (const paragraph of (body || '-').split('\n')) {
      writeLines(paragraph || ' ', 10, 'normal', 9, 5)
    }
    y += 2
    ensureSpace(4)
    doc.setDrawColor(210)
    doc.line(margin, y, pageWidth - margin, y)
    y += 6
  })

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('DejaVuSans', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(90)
    doc.text(`Sayfa ${i} / ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' })
    doc.setTextColor(0)
  }

  const safePerson = person.replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '')
  doc.save(`Gunluk_Hatirlatmalar_${date}_${safePerson || 'kisi'}.pdf`)
}
