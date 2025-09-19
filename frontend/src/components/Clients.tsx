import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api, Client } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useRealTimeData } from '@/hooks/use-real-time-data'

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()
  const { hasChangesForEntity, clearDataChanges } = useRealTimeData()

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    if (hasChangesForEntity('client')) {
      loadClients()
      clearDataChanges()
    }
  }, [hasChangesForEntity, clearDataChanges])

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
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (clientId: string) => {
    if (!confirm('Bu müvekkili silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await api.clients.delete(clientId)
      setClients(clients.filter(c => c.id !== clientId))
      toast({
        title: "Başarılı",
        description: "Müvekkil başarıyla silindi.",
      })
    } catch (error: any) {
      const errorMessage = error.message.includes('existing cases') 
        ? 'Bu müvekkile ait dava dosyaları bulunduğu için silinemez.'
        : 'Müvekkil silinirken bir hata oluştu.'
      
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    (client.vekalet_ofis_no && client.vekalet_ofis_no.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <h1 className="text-3xl font-bold text-gray-900">Müvekkiller</h1>
        <Button asChild>
          <Link to="/clients/new">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Müvekkil
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Ad, email, telefon veya vekalet ofis no ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? 'Arama kriterlerinize uygun müvekkil bulunamadı.' : 'Henüz müvekkil bulunmuyor.'}
            </p>
            {!searchTerm && (
              <Button asChild className="mt-4">
                <Link to="/clients/new">İlk Müvekkili Ekle</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{client.name}</CardTitle>
                <CardDescription>
                  Kayıt: {new Date(client.created_at).toLocaleDateString('tr-TR')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    {client.phone}
                  </div>
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{client.address}</span>
                  </div>
                  <div className="flex items-center justify-end space-x-2 pt-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/clients/edit/${client.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(client.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
