import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { api, CompensationLetter } from '@/lib/api'

export default function CompensationLetters() {
  const [letters, setLetters] = useState<CompensationLetter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
    loadLetters()
  }, [statusFilter])

  const loadLetters = async () => {
    try {
      const params = statusFilter && statusFilter !== 'all' ? { status: statusFilter } : undefined
      const lettersData = await api.compensationLetters.getAll(params)
      setLetters(lettersData)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Tezminat mektupları yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (letterId: string) => {
    if (!confirm('Bu tezminat mektubunu silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await api.compensationLetters.delete(letterId)
      setLetters(letters.filter(l => l.id !== letterId))
      toast({
        title: "Başarılı",
        description: "Tezminat mektubu başarıyla silindi.",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Tezminat mektubu silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const filteredLetters = letters.filter(letter =>
    letter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    letter.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    letter.letter_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    letter.customer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Tezminat Mektupları</h1>
        <Button asChild>
          <Link to="/compensation-letters/new">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Tezminat Mektubu
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Mektup başlığı, müvekkil adı, mektup numarası veya müşteri ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Durum filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="İade Edildi">İade Edildi</SelectItem>
            <SelectItem value="İade Taleb Edildi">İade Taleb Edildi</SelectItem>
            <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredLetters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm || (statusFilter && statusFilter !== 'all') ? 'Arama kriterlerinize uygun tezminat mektubu bulunamadı.' : 'Henüz tezminat mektubu bulunmuyor.'}
            </p>
            {!searchTerm && (!statusFilter || statusFilter === 'all') && (
              <Button asChild className="mt-4">
                <Link to="/compensation-letters/new">İlk Tezminat Mektubunu Oluştur</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mektup No</TableHead>
                  <TableHead>Banka</TableHead>
                  <TableHead>Müşteri No</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Mahkeme</TableHead>
                  <TableHead>Dosya No</TableHead>
                  <TableHead>Durumu</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLetters.map((letter) => (
                  <TableRow key={letter.id}>
                    <TableCell className="font-medium">{letter.letter_number}</TableCell>
                    <TableCell>{letter.bank}</TableCell>
                    <TableCell>{letter.customer_number}</TableCell>
                    <TableCell>{letter.customer}</TableCell>
                    <TableCell>{letter.court}</TableCell>
                    <TableCell>{letter.case_number}</TableCell>
                    <TableCell>{letter.status}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/compensation-letters/${letter.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(letter.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
