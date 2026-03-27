import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { api, ClientCreate, ClientUpdate } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ClientForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { toast } = useToast()
  const { t } = useLanguage()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    tax_id: '',
    vekalet_ofis_no: ''
  })
  const [currentVersion, setCurrentVersion] = useState<number>(1)

  useEffect(() => {
    if (isEdit && id) {
      loadClient(id)
    }
  }, [isEdit, id])

  const loadClient = async (clientId: string) => {
    try {
      const clientData = await api.clients.getById(clientId)
      console.log('API Response for client:', clientData)
      console.log('vekalet_ofis_no from API:', clientData.vekalet_ofis_no)
      console.log('tax_id from API:', clientData.tax_id)
      
      const formDataToSet = {
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        address: clientData.address,
        tax_id: clientData.tax_id || '',
        vekalet_ofis_no: clientData.vekalet_ofis_no || ''
      }
      
      console.log('Form data being set:', formDataToSet)
      setFormData(formDataToSet)
      setCurrentVersion(clientData.version)
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.clients.clientLoadError,
        variant: "destructive",
      })
      navigate('/clients')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit && id) {
        const updateData: ClientUpdate = {
          ...formData,
          vekalet_ofis_no: formData.vekalet_ofis_no || undefined,
          version: currentVersion
        }
        await api.clients.update(id, updateData)
        toast({
          title: t.common.success,
          description: t.clients.clientUpdated,
        })
        navigate('/clients')
      } else {
        const createData: ClientCreate = {
          ...formData,
          vekalet_ofis_no: formData.vekalet_ofis_no || undefined
        }
        await api.clients.create(createData)
        toast({
          title: t.common.success,
          description: t.clients.clientCreated,
        })
        navigate('/clients')
      }
    } catch (error: any) {
      if (error.status === 409) {
        toast({
          title: t.clients.conflictError,
          description: t.clients.conflictErrorDescription,
          variant: "destructive",
        })
        if (isEdit && id) {
          loadClient(id)
        }
      } else {
        toast({
          title: t.common.error,
          description: isEdit ? t.clients.clientUpdateError : t.clients.clientCreateError,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate('/clients')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.common.back}
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? t.clients.editClient : t.clients.newClient}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? t.clients.editClientInfo : t.clients.createNewClient}</CardTitle>
          <CardDescription>
            {isEdit ? t.clients.updateExistingClientInfo : t.clients.createNewClientRecord}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t.clients.fullName} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder={t.clients.enterClientName}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t.clients.powerOfAttorneyInfo}</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder={t.clients.enterPowerOfAttorneyInfo}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t.clients.phone} *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder={t.clients.enterPhoneNumber}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vekalet_ofis_no">{t.clients.powerOfAttorneyOfficeNo}</Label>
                <Input
                  id="vekalet_ofis_no"
                  value={formData.vekalet_ofis_no}
                  onChange={(e) => handleChange('vekalet_ofis_no', e.target.value)}
                  placeholder={t.clients.enterPowerOfAttorneyOfficeNo}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_id">{t.clients.clientTcOrTaxNo}</Label>
              <Input
                id="tax_id"
                value={formData.tax_id}
                onChange={(e) => handleChange('tax_id', e.target.value)}
                placeholder={t.clients.enterTcOrTaxNo}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t.clients.address} *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder={t.clients.enterClientAddress}
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate('/clients')}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? t.common.saving : (isEdit ? t.common.update : t.common.create)}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
