import { useState, useEffect } from 'react'
import { Search, Download, Check, ChevronsUpDown } from 'lucide-react'
import jsPDF from 'jspdf'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { api, Client, Case, CaseSearchParams } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function CaseSearch() {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [searchResults, setSearchResults] = useState<Case[]>([])
  const [courtOpen, setCourtOpen] = useState(false)
  const [searchParams, setSearchParams] = useState<CaseSearchParams>({
    case_type: '',
    status: '',
    court: '',
    client_id: '',
    defendant: '',
  })
  const { toast } = useToast()

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const clientsData = await api.clients.getAll()
      setClients(clientsData)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Müvekkiller yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const filteredParams: CaseSearchParams = {}
      
      if (searchParams.case_type) filteredParams.case_type = searchParams.case_type
      if (searchParams.status) filteredParams.status = searchParams.status
      if (searchParams.court) filteredParams.court = searchParams.court
      if (searchParams.client_id) filteredParams.client_id = searchParams.client_id
      if (searchParams.defendant) filteredParams.defendant = searchParams.defendant

      const results = await api.cases.search(filteredParams)
      setSearchResults(results)
      
      toast({
        title: "Başarılı",
        description: `${results.length} dava bulundu.`,
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Arama sırasında bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    if (searchResults.length === 0) {
      toast({
        title: "Uyarı",
        description: "Dışa aktarılacak dava bulunamadı.",
        variant: "destructive",
      })
      return
    }

    const doc = new jsPDF('l', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    
    doc.setFillColor(41, 128, 185) // Blue background
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    doc.setTextColor(255, 255, 255) // White text
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text('LexCloud', margin, 15)
    
    doc.setFontSize(14)
    doc.text('Dava Sorgulama Sonuçları', margin, 25)
    
    doc.setTextColor(0, 0, 0) // Black text
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, margin, 45)
    doc.text(`Toplam Dava Sayısı: ${searchResults.length}`, margin, 52)
    
    const headers = [
      'Mahkeme/İcra',
      'Dosya No',
      'Müvekkil',
      'Karşı Taraf',
      'Hatırlatma Tarihi',
      'Hatırlatma Metni',
      'Durum',
      'Dava Türü',
      'Açılış Tarihi',
      'Duruşma Tarihi',
      'Ofis Arşiv No',
      'Özel Not'
    ]
    
    const tableData = searchResults.map(case_ => [
      case_.court || '-',
      case_.case_number || '-',
      case_.client_name || '-',
      case_.defendant || '-',
      case_.reminder_date ? new Date(case_.reminder_date).toLocaleDateString('tr-TR') : '-',
      case_.description || '-',
      case_.status || '-',
      case_.case_type || '-',
      case_.start_date ? new Date(case_.start_date).toLocaleDateString('tr-TR') : '-',
      case_.next_hearing_date ? new Date(case_.next_hearing_date).toLocaleDateString('tr-TR') : '-',
      case_.office_archive_no || '-',
      case_.notes || '-'
    ])
    
    const tableWidth = pageWidth - (margin * 2)
    const colWidths = [40, 25, 30, 30, 25, 45, 20, 25, 25, 25, 25, 35] // Optimized for Turkish text and better readability
    const rowHeight = 12
    let yPosition = 65
    
    const wrapText = (text: string, maxWidth: number) => {
      const words = text.split(' ')
      const lines = []
      let currentLine = ''
      
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word
        const textWidth = doc.getTextWidth(testLine)
        
        if (textWidth > maxWidth && currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      }
      
      if (currentLine) {
        lines.push(currentLine)
      }
      
      return lines
    }
    
    doc.setFillColor(52, 73, 94) // Dark blue-gray
    doc.rect(margin, yPosition - 8, tableWidth, rowHeight, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    
    let xPosition = margin + 2
    headers.forEach((header, index) => {
      const lines = wrapText(header, colWidths[index] - 4)
      lines.forEach((line, lineIndex) => {
        doc.text(line, xPosition, yPosition - 2 + (lineIndex * 4))
      })
      xPosition += colWidths[index]
    })
    
    yPosition += rowHeight
    
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    
    tableData.forEach((row, rowIndex) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        yPosition = 20
        
        doc.setFillColor(52, 73, 94)
        doc.rect(margin, yPosition - 8, tableWidth, rowHeight, 'F')
        
        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        
        xPosition = margin + 2
        headers.forEach((header, index) => {
          const lines = wrapText(header, colWidths[index] - 4)
          lines.forEach((line, lineIndex) => {
            doc.text(line, xPosition, yPosition - 2 + (lineIndex * 4))
          })
          xPosition += colWidths[index]
        })
        
        yPosition += rowHeight
        doc.setTextColor(0, 0, 0)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
      }
      
      if (rowIndex % 2 === 0) {
        doc.setFillColor(248, 249, 250) // Light gray
        doc.rect(margin, yPosition - 8, tableWidth, rowHeight, 'F')
      }
      
      doc.setDrawColor(200, 200, 200)
      doc.rect(margin, yPosition - 8, tableWidth, rowHeight, 'S')
      
      xPosition = margin + 2
      let maxLinesInRow = 1
      
      row.forEach((cell, colIndex) => {
        const cellText = String(cell)
        const lines = wrapText(cellText, colWidths[colIndex] - 4)
        maxLinesInRow = Math.max(maxLinesInRow, lines.length)
        
        lines.forEach((line, lineIndex) => {
          doc.text(line, xPosition, yPosition - 2 + (lineIndex * 4))
        })
        
        doc.line(xPosition + colWidths[colIndex] - 2, yPosition - 8, xPosition + colWidths[colIndex] - 2, yPosition + 4)
        xPosition += colWidths[colIndex]
      })
      
      yPosition += Math.max(rowHeight, maxLinesInRow * 4 + 4)
    })
    
    const casesWithNotes = searchResults.filter(c => c.notes || c.description)
    if (casesWithNotes.length > 0) {
      doc.addPage()
      
      doc.setFillColor(41, 128, 185)
      doc.rect(0, 0, pageWidth, 25, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('Açıklamalar ve Notlar', margin, 15)
      
      let notesY = 40
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      
      casesWithNotes.forEach((case_) => {
        if (notesY > pageHeight - 50) {
          doc.addPage()
          notesY = 20
        }
        
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text(`${case_.case_number} - ${case_.title || 'Başlıksız Dava'}`, margin, notesY)
        notesY += 8
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        
        if (case_.description) {
          doc.text('Açıklama:', margin, notesY)
          notesY += 6
          const descLines = wrapText(case_.description, pageWidth - (margin * 2) - 10)
          descLines.forEach(line => {
            doc.text(line, margin + 10, notesY)
            notesY += 5
          })
          notesY += 3
        }
        
        if (case_.notes) {
          doc.text('Notlar:', margin, notesY)
          notesY += 6
          const noteLines = wrapText(case_.notes, pageWidth - (margin * 2) - 10)
          noteLines.forEach(line => {
            doc.text(line, margin + 10, notesY)
            notesY += 5
          })
          notesY += 3
        }
        
        doc.setDrawColor(200, 200, 200)
        doc.line(margin, notesY, pageWidth - margin, notesY)
        notesY += 10
      })
    }
    
    const totalPages = doc.internal.pages.length - 1
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setTextColor(128, 128, 128)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.text(`Sayfa ${i} / ${totalPages}`, pageWidth - margin - 20, pageHeight - 10)
      doc.text('LexCloud Dava Takip Sistemi', margin, pageHeight - 10)
    }
    
    doc.save(`dava_sorgulama_${new Date().toISOString().split('T')[0]}.pdf`)
    
    toast({
      title: "Başarılı",
      description: `${searchResults.length} dava profesyonel PDF formatında dışa aktarıldı.`,
    })
  }

  const handleParamChange = (field: keyof CaseSearchParams, value: string) => {
    setSearchParams(prev => ({ ...prev, [field]: value === 'all' ? undefined : value || undefined }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dava Sorgulama</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arama Filtreleri</CardTitle>
          <CardDescription>
            Dava Dosyalarını filtrelemek için aşağıdaki kriterleri kullanın.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="case_type">Dava Türü</Label>
              <Select value={searchParams.case_type || ''} onValueChange={(value) => handleParamChange('case_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Dava türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="Ceza">Ceza</SelectItem>
                  <SelectItem value="Hukuk">Hukuk</SelectItem>
                  <SelectItem value="İcra">İcra</SelectItem>
                  <SelectItem value="İdari Yargı">İdari Yargı</SelectItem>
                  <SelectItem value="Satış Memuru">Satış Memuru</SelectItem>
                  <SelectItem value="Arabuluculuk">Arabuluculuk</SelectItem>
                  <SelectItem value="Tazminat Komisyonu Başkanlığı">Tazminat Komisyonu Başkanlığı</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="court">Mahkeme</Label>
              <Popover open={courtOpen} onOpenChange={setCourtOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={courtOpen}
                    className="w-full justify-between"
                  >
                    {searchParams.court || "Mahkeme seçin veya yazın..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Mahkeme ara veya yaz..." 
                      value={searchParams.court}
                      onValueChange={(value) => handleParamChange('court', value)}
                    />
                    <CommandList>
                      <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
                      <CommandGroup>
                        {[
                          "ADANA BANKA ALACAKLARI",
                          "GAYRİMENKUL SATIŞ İCRA DAİRESİ",
                          "ADANA 1. GENEL İCRA DAİRESİ",
                          "ADANA 2. GENEL İCRA DAİRESİ",
                          "ADANA 3. GENEL İCRA DAİRESİ",
                          "GAZİANTEP İCRA DAİRESİ"
                        ].map((court) => (
                          <CommandItem
                            key={court}
                            value={court}
                            onSelect={(currentValue) => {
                              handleParamChange('court', currentValue)
                              setCourtOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                searchParams.court === court ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {court}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Durum</Label>
              <Select value={searchParams.status || ''} onValueChange={(value) => handleParamChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="Beraat">Beraat</SelectItem>
                  <SelectItem value="Ceza">Ceza</SelectItem>
                  <SelectItem value="Kısmen kabul Kısmen red">Kısmen kabul Kısmen red</SelectItem>
                  <SelectItem value="Kabul">Kabul</SelectItem>
                  <SelectItem value="Red">Red</SelectItem>
                  <SelectItem value="Temyiz">Temyiz</SelectItem>
                  <SelectItem value="İstinaf">İstinaf</SelectItem>
                  <SelectItem value="İtirazlı">İtirazlı</SelectItem>
                  <SelectItem value="Derdest">Derdest</SelectItem>
                  <SelectItem value="Protokollü">Protokollü</SelectItem>
                  <SelectItem value="Sözlü Taahütlü">Sözlü Taahütlü</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Müvekkil</Label>
              <Select value={searchParams.client_id || ''} onValueChange={(value) => handleParamChange('client_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Müvekkil seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defendant">Karşı Taraf</Label>
              <Input
                id="defendant"
                placeholder="Karşı taraf adı ara..."
                value={searchParams.defendant || ''}
                onChange={(e) => handleParamChange('defendant', e.target.value)}
              />
            </div>

          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button type="button" variant="outline" onClick={() => setSearchParams({
              case_type: '',
              status: '',
              court: '',
              client_id: '',
              defendant: '',
            })}>
              Temizle
            </Button>
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Aranıyor...' : 'Ara'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Arama Sonuçları</CardTitle>
                <CardDescription>
                  {searchResults.length} dava bulundu
                </CardDescription>
              </div>
              <Button onClick={handleExportPDF} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                PDF İndir
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Mahkeme</TableHead>
                    <TableHead className="w-[120px]">Dosya No</TableHead>
                    <TableHead className="w-[150px]">Müvekkil</TableHead>
                    <TableHead className="w-[150px]">Karşı Taraf</TableHead>
                    <TableHead className="w-[120px]">Hatırlatma Tarihi</TableHead>
                    <TableHead className="w-[200px]">Hatırlatma Metni</TableHead>
                    <TableHead className="w-[100px]">Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((case_) => (
                    <TableRow key={case_.id}>
                      <TableCell className="font-medium">
                        <div className="max-w-[180px] truncate" title={case_.court}>
                          {case_.court}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[100px] truncate" title={case_.case_number}>
                          {case_.case_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[130px] truncate" title={case_.client_name}>
                          {case_.client_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[130px] truncate" title={case_.defendant}>
                          {case_.defendant}
                        </div>
                      </TableCell>
                      <TableCell>
                        {case_.reminder_date 
                          ? new Date(case_.reminder_date).toLocaleDateString('tr-TR')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[180px] truncate" title={case_.description}>
                          {case_.description || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="text-xs">
                          {case_.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
