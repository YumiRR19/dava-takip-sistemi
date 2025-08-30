import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { api, Client, CompensationLetterCreate, CompensationLetterUpdate } from '@/lib/api'

export default function CompensationLetterForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEdit = Boolean(id)

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    letter_number: '',
    bank: '',
    customer_number: '',
    customer: '',
    court: '',
    case_number: '',
    status: ''
  })

  useEffect(() => {
    loadClients()
    if (isEdit && id) {
      loadLetter(id)
    }
  }, [id, isEdit])

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

  const loadLetter = async (letterId: string) => {
    try {
      const letter = await api.compensationLetters.getById(letterId)
      setFormData({
        title: letter.title,
        client_id: letter.client_id,
        letter_number: letter.letter_number,
        bank: letter.bank,
        customer_number: letter.customer_number,
        customer: letter.customer,
        court: letter.court,
        case_number: letter.case_number,
        status: letter.status
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Tezminat mektubu yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
      navigate('/compensation-letters')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit && id) {
        const updateData: CompensationLetterUpdate = {
          title: formData.title,
          letter_number: formData.letter_number,
          bank: formData.bank,
          customer_number: formData.customer_number,
          customer: formData.customer,
          court: formData.court,
          case_number: formData.case_number,
          status: formData.status
        }
        await api.compensationLetters.update(id, updateData)
        toast({
          title: "Başarılı",
          description: "Tezminat mektubu başarıyla güncellendi.",
        })
      } else {
        const createData: CompensationLetterCreate = {
          title: formData.title,
          client_id: formData.client_id,
          letter_number: formData.letter_number,
          bank: formData.bank,
          customer_number: formData.customer_number,
          customer: formData.customer,
          court: formData.court,
          case_number: formData.case_number,
          status: formData.status
        }
        await api.compensationLetters.create(createData)
        toast({
          title: "Başarılı",
          description: "Tezminat mektubu başarıyla oluşturuldu.",
        })
      }
      navigate('/compensation-letters')
    } catch (error) {
      toast({
        title: "Hata",
        description: isEdit ? "Tezminat mektubu güncellenirken bir hata oluştu." : "Tezminat mektubu oluşturulurken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate('/compensation-letters')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Tezminat Mektubu Düzenle' : 'Yeni Tezminat Mektubu'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Tezminat Mektubu Bilgilerini Düzenle' : 'Tezminat Mektubu Bilgileri'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_id">Müvekkil *</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Müvekkil seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="letter_number">Mektup No *</Label>
                <Input
                  id="letter_number"
                  value={formData.letter_number}
                  onChange={(e) => setFormData({ ...formData, letter_number: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank">Banka *</Label>
                <Select
                  value={formData.bank}
                  onValueChange={(value) => setFormData({ ...formData, bank: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Banka seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TÜRKİYE VAKIFLAR BANKASI T.A.O.">TÜRKİYE VAKIFLAR BANKASI T.A.O.</SelectItem>
                    <SelectItem value="TÜRKİYE GARANTİ BANKASI A.Ş.">TÜRKİYE GARANTİ BANKASI A.Ş.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_number">Müşteri No *</Label>
                <Input
                  id="customer_number"
                  value={formData.customer_number}
                  onChange={(e) => setFormData({ ...formData, customer_number: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer">Müşteri *</Label>
                <Input
                  id="customer"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="court">Mahkeme *</Label>
                <Input
                  id="court"
                  value={formData.court}
                  onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="case_number">Dosya No *</Label>
                <Input
                  id="case_number"
                  value={formData.case_number}
                  onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="status">Durumu *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="İade Edildi">İade Edildi</SelectItem>
                    <SelectItem value="İade Taleb Edildi">İade Taleb Edildi</SelectItem>
                    <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate('/compensation-letters')}>
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Oluştur')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
