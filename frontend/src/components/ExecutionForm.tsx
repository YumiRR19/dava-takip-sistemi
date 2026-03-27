import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Check, ChevronsUpDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { api, Client, ExecutionCreate, ExecutionUpdate } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useFormAutosave } from '@/hooks/use-form-autosave'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ExecutionForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const { toast } = useToast()
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    client_id: '',
    defendant: '',
    execution_office: '',
    execution_number: '',
    status: '',
    execution_type: 'İcra',
    start_date: '',
    office_archive_no: '',
    reminder_date: '',
    reminder_text: '',
    notes: '',
    haciz_durumu: '',
    responsible_person: '',
    görevlendiren: ''
  })
  const [currentVersion, setCurrentVersion] = useState<number>(1)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [clientsLoading, setClientsLoading] = useState(false)
  const [clientsError, setClientsError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const requestIdRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [executionOfficeOpen, setExecutionOfficeOpen] = useState(false)
  
  const { loadDraft, clearDraft } = useFormAutosave({
    key: `execution_${id || 'new'}`,
    data: formData,
    enabled: !loading && !clientsLoading
  })

  useEffect(() => {
    loadClients()
    if (isEdit && id) {
      loadExecution(id)
    } else {
      const draft = loadDraft()
      if (draft) {
        setFormData(prev => ({ ...prev, ...draft }))
      }
    }
  }, [isEdit, id])

  const loadClients = async (attempt = 1) => {
    const maxRetries = 3
    const timeout = 5000
    
    const t0 = Date.now()
    console.log(`[ExecutionForm] t0 fetch start: ${t0}, attempt: ${attempt}`)
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    const requestId = ++requestIdRef.current
    const abortController = new AbortController()
    abortControllerRef.current = abortController
    
    let active = true
    
    try {
      if (requestId === requestIdRef.current) {
        setClientsLoading(true)
        setClientsError(null)
      }
      
      const timeoutPromise = new Promise<'timeout'>((resolve) => 
        setTimeout(() => resolve('timeout'), timeout)
      )
      
      const result = await Promise.race([
        api.clients.getAll({ signal: abortController.signal }).catch(err => {
          if (err.name === 'AbortError') throw err
          throw new Error(`API Error: ${err.message || 'Unknown error'}`)
        }),
        timeoutPromise
      ])
      
      const t1 = Date.now()
      console.log(`[ExecutionForm] t1 response: ${t1}, duration: ${t1-t0}ms, result type: ${result === 'timeout' ? 'timeout' : 'data'}`)
      
      if (!active || requestId !== requestIdRef.current) {
        console.log(`[ExecutionForm] Stale request ${requestId}, current: ${requestIdRef.current}`)
        return
      }
      
      if (result === 'timeout') {
        console.log(`[ExecutionForm] Request timeout after ${timeout}ms, attempt ${attempt}`)
        
        if (attempt < maxRetries) {
          const backoffDelay = Math.pow(2, attempt - 1) * 1000
          setTimeout(() => {
            if (active && requestId === requestIdRef.current) {
              setRetryCount(attempt)
              loadClients(attempt + 1)
            }
          }, backoffDelay)
          return
        } else {
          setClientsError(t.executions.clientsTimeoutError)
        }
      } else {
        const clientsData = result as Client[]
        const t2 = Date.now()
        console.log(`[ExecutionForm] t2 setClients: ${t2}, count: ${clientsData.length}`)
        
        setClients(clientsData)
        setRetryCount(0)
        
        const t4 = Date.now()
        console.log(`[ExecutionForm] t4 setError(false): ${t4}`)
        setClientsError(null)
        
        if (clientsData.length > 0 && !formData.client_id) {
          setFormData(prev => ({ ...prev, client_id: clientsData[0].id }))
        }
      }
      
    } catch (error: any) {
      const t1 = Date.now()
      console.error(`[ExecutionForm] Error loading clients (attempt ${attempt}):`, error)
      console.log(`[ExecutionForm] t1 error: ${t1}, duration: ${t1-t0}ms, error: ${error.message}`)
      
      if (!active || requestId !== requestIdRef.current) {
        console.log(`[ExecutionForm] Stale error request ${requestId}, current: ${requestIdRef.current}`)
        return
      }
      
      if (error.name === 'AbortError') {
        return
      }
      
      if (attempt < maxRetries) {
        const backoffDelay = Math.pow(2, attempt - 1) * 1000
        setTimeout(() => {
          if (active && requestId === requestIdRef.current) {
            setRetryCount(attempt)
            loadClients(attempt + 1)
          }
        }, backoffDelay)
        return
      }
      
      setClientsError(t.executions.clientsLoadError)
      setClientsLoading(false)
      toast({
        title: t.common.error,
        description: t.executions.clientsLoadError,
        variant: "destructive",
      })
    } finally {
      const t3 = Date.now()
      console.log(`[ExecutionForm] t3 finally setLoading(false): ${t3}, requestId: ${requestId}, current: ${requestIdRef.current}`)
      
      if (requestId === requestIdRef.current) {
        setClientsLoading(false)
      }
    }
    
    return () => {
      active = false
      if (abortController === abortControllerRef.current) {
        abortController.abort()
      }
    }
  }

  const loadExecution = async (executionId: string) => {
    try {
      const executionData = await api.executions.getById(executionId)
      setFormData({
        client_id: executionData.client_id,
        defendant: executionData.defendant,
        execution_office: executionData.execution_office,
        execution_number: executionData.execution_number,
        status: executionData.status,
        execution_type: executionData.execution_type,
        start_date: executionData.start_date ? new Date(executionData.start_date).toISOString().split('T')[0] : '',
        office_archive_no: executionData.office_archive_no || '',
        reminder_date: executionData.reminder_date ? new Date(executionData.reminder_date).toISOString().split('T')[0] : '',
        reminder_text: executionData.reminder_text || '',
        notes: executionData.notes || '',
        haciz_durumu: executionData.haciz_durumu || '',
        responsible_person: executionData.responsible_person || '',
        görevlendiren: executionData.görevlendiren || ''
      })
      setCurrentVersion(executionData.version)
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.executions.executionLoadError,
        variant: "destructive",
      })
      navigate('/executions')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (clientsLoading) {
      toast({
        title: t.common.warning,
        description: t.executions.pleaseWaitClientsLoading,
        variant: "destructive",
      })
      return
    }

    if (!formData.client_id) {
      toast({
        title: t.common.error,
        description: t.executions.pleaseSelectClient,
        variant: "destructive",
      })
      return
    }
    
    if (!clients.find(c => c.id === formData.client_id)) {
      toast({
        title: t.common.error,
        description: t.executions.selectedClientInvalid,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const submissionData = {
      client_id: formData.client_id,
      defendant: formData.defendant,
      execution_office: formData.execution_office,
      execution_number: formData.execution_number,
      status: formData.status,
      execution_type: formData.execution_type,
      start_date: formData.start_date,
      office_archive_no: formData.office_archive_no,
      reminder_date: formData.reminder_date || undefined,
      reminder_text: formData.reminder_text || undefined,
      notes: formData.notes || undefined,
      haciz_durumu: formData.haciz_durumu || undefined,
      responsible_person: formData.responsible_person || undefined,
      görevlendiren: formData.görevlendiren || undefined
    }

    try {
      if (isEdit && id) {
        const updateData: ExecutionUpdate = { 
          ...submissionData,
          version: currentVersion
        }
        if (!updateData.reminder_date) {
          delete updateData.reminder_date
        }
        await api.executions.update(id, updateData)
        toast({
          title: t.common.success,
          description: t.executions.executionUpdated,
        })
      } else {
        const createData: ExecutionCreate = {
          ...submissionData,
          reminder_date: submissionData.reminder_date || undefined,
          reminder_text: submissionData.reminder_text || undefined,
          notes: submissionData.notes || undefined,
        }
        await api.executions.create(createData)
        toast({
          title: t.common.success,
          description: t.executions.executionCreated,
        })
        clearDraft()
      }
      navigate('/executions')
    } catch (error: any) {
      console.error('Submission error:', error)
      if (error.status === 409) {
        toast({
          title: t.executions.conflictError,
          description: t.executions.conflictErrorDescription,
          variant: "destructive",
        })
        if (isEdit && id) {
          loadExecution(id)
        }
      } else {
        const errorMessage = error.message || (isEdit ? t.executions.executionUpdateError : t.executions.executionCreateError)
        toast({
          title: t.common.error,
          description: errorMessage,
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
        <Button variant="outline" onClick={() => navigate('/executions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.common.back}
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? t.executions.editExecution : t.executions.newExecution}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? t.executions.editExecutionInfo : t.executions.createNewExecution}</CardTitle>
          <CardDescription>
            {isEdit ? t.executions.updateExistingExecutionInfo : t.executions.createNewExecutionRecord}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="client_id">{t.executions.client} *</Label>
                <Select 
                  key={`client-select-${clientsLoading}-${clients.length}-${!!clientsError}`}
                  value={formData.client_id} 
                  onValueChange={(value) => handleChange('client_id', value)} 
                  name="client_id"
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      clientsLoading ? t.executions.clientsLoading :
                      clientsError ? t.common.errorOccurred :
                      clients.length === 0 ? t.executions.noClientsFound :
                      t.executions.selectClient
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsError ? (
                      <div className="p-4 text-center">
                        <p className="text-sm text-red-600 mb-2">{clientsError}</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => loadClients()}
                          disabled={clientsLoading}
                        >
                          {t.common.retry}
                        </Button>
                      </div>
                    ) : clients.length === 0 && !clientsLoading ? (
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-600 mb-2">{t.executions.noClientsAddedYet}</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => navigate('/clients/new')}
                        >
                          {t.executions.addClient}
                        </Button>
                      </div>
                    ) : (
                      clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defendant">{t.executions.defendant} *</Label>
                <Input
                  id="defendant"
                  name="defendant"
                  value={formData.defendant}
                  onChange={(e) => handleChange('defendant', e.target.value)}
                  placeholder={t.executions.enterDefendantName}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="execution_office">{t.executions.executionOffice} *</Label>
                <Popover open={executionOfficeOpen} onOpenChange={setExecutionOfficeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={executionOfficeOpen}
                      className="w-full justify-between"
                    >
                      {formData.execution_office || t.executions.selectOrTypeExecutionOffice}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput 
                        placeholder={t.executions.searchOrTypeExecutionOffice}
                        value={formData.execution_office}
                        onValueChange={(value) => handleChange('execution_office', value)}
                      />
                      <CommandList>
                        <CommandEmpty>{t.common.noResultsFound}</CommandEmpty>
                        <CommandGroup>
                          {[
                            "ADANA 1.GENEL İCRA",
                            "ADANA 2.GENEL İCRA",
                            "ADANA 3.GENEL İCRA",
                            "ADANA BANKA ALACAKLARI İCRA DAİRESİ",
                            "GAYRİMENKUL SATIŞ İCRA DAİRESİ",
                            "GAZİANTEP İCRA DAİRESİ",
                            "KAHRAMANMARAŞ İCRA DAİRESİ"
                          ].map((office) => (
                            <CommandItem
                              key={office}
                              value={office}
                              onSelect={(currentValue) => {
                                handleChange('execution_office', currentValue)
                                setExecutionOfficeOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.execution_office === office ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {office}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="execution_number">{t.executions.executionFileNo} *</Label>
                <Input
                  id="execution_number"
                  name="execution_number"
                  value={formData.execution_number}
                  onChange={(e) => handleChange('execution_number', e.target.value)}
                  placeholder={t.executions.enterExecutionNumber}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t.executions.status} *</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)} name="status">
                  <SelectTrigger>
                    <SelectValue placeholder={t.executions.selectStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Derdest">{t.executionStatuses.pending}</SelectItem>
                    <SelectItem value="İnfaz">{t.executionStatuses.enforcement}</SelectItem>
                    <SelectItem value="Haricen Tahsil">{t.executionStatuses.externalCollection}</SelectItem>
                    <SelectItem value="İtirazlı">{t.executionStatuses.objected}</SelectItem>
                    <SelectItem value="İcranın Geri Bırakılması">{t.executionStatuses.executionPostponed}</SelectItem>
                    <SelectItem value="Davalı">{t.executionStatuses.sued}</SelectItem>
                    <SelectItem value="Ödeme Sözü">{t.executionStatuses.paymentPromise}</SelectItem>
                    <SelectItem value="Bilirkişi">{t.executionStatuses.expert}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="execution_type">{t.executions.executionTypeFilter} *</Label>
                <Select value={formData.execution_type} onValueChange={(value) => handleChange('execution_type', value)} name="execution_type">
                  <SelectTrigger>
                    <SelectValue placeholder={t.executions.selectExecutionType} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="İlamsız Kredi Kartı">{t.executionTypes.creditCardNoJudgment}</SelectItem>
                    <SelectItem value="İlamsız İhtiyaç Kartı">{t.executionTypes.consumerLoanNoJudgment}</SelectItem>
                    <SelectItem value="İlamsız GKS">{t.executionTypes.gksNoJudgment}</SelectItem>
                    <SelectItem value="Kambiyo / Bono">{t.executionTypes.billOfExchange}</SelectItem>
                    <SelectItem value="Kambiyo / Çek">{t.executionTypes.check}</SelectItem>
                    <SelectItem value="İlamsız / Çek">{t.executionTypes.checkNoJudgment}</SelectItem>
                    <SelectItem value="Rehin – Örnek 8">{t.executionTypes.pledgeSample8}</SelectItem>
                    <SelectItem value="İpotek – Örnek 6">{t.executionTypes.mortgageSample6}</SelectItem>
                    <SelectItem value="İpotek – Örnek 9">{t.executionTypes.mortgageSample9}</SelectItem>
                    <SelectItem value="Örnek 4-5">{t.executionTypes.sample45}</SelectItem>
                    <SelectItem value="İlamsız Fatura">{t.executionTypes.invoiceNoJudgment}</SelectItem>
                    <SelectItem value="Nafaka – Örnek 49">{t.executionTypes.alimonySample49}</SelectItem>
                    <SelectItem value="İhtiyat-İ Tedbir">{t.executionTypes.precautionaryMeasure}</SelectItem>
                    <SelectItem value="Adi Kira ve Hasılat Kirası – Örnek 13">{t.executionTypes.ordinaryRentSample13}</SelectItem>
                    <SelectItem value="Tahliye – Örnek 14">{t.executionTypes.evictionSample14}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">{t.executions.startDate} *</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="office_archive_no">{t.executions.officeArchiveNo}</Label>
                <Input
                  id="office_archive_no"
                  name="office_archive_no"
                  value={formData.office_archive_no}
                  onChange={(e) => handleChange('office_archive_no', e.target.value)}
                  placeholder={t.executions.enterOfficeArchiveNo}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder_date">{t.executions.reminderDate}</Label>
                <Input
                  id="reminder_date"
                  name="reminder_date"
                  type="date"
                  value={formData.reminder_date}
                  onChange={(e) => handleChange('reminder_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="haciz_durumu">{t.executions.seizureStatus}</Label>
                <Select value={formData.haciz_durumu} onValueChange={(value) => handleChange('haciz_durumu', value)} name="haciz_durumu">
                  <SelectTrigger>
                    <SelectValue placeholder={t.executions.selectSeizureStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hacizli Araç">{t.seizureStatuses.seizedVehicle}</SelectItem>
                    <SelectItem value="Rehinli Araç">{t.seizureStatuses.pledgedVehicle}</SelectItem>
                    <SelectItem value="Yakalamalı / Şatış">{t.seizureStatuses.wantedForSale}</SelectItem>
                    <SelectItem value="İpotekli / Gayrimenkul">{t.seizureStatuses.mortgagedRealEstate}</SelectItem>
                    <SelectItem value="Hacizli / Gayrimenkul">{t.seizureStatuses.seizedRealEstate}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="görevlendiren">{t.executions.assignedByFilter}</Label>
              <Select value={formData.görevlendiren} onValueChange={(value) => handleChange('görevlendiren', value)} name="görevlendiren">
                <SelectTrigger>
                  <SelectValue placeholder={t.executions.selectAssignedBy} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Av.M.Şerif Bey">{t.responsiblePersons.avMSerifBey}</SelectItem>
                  <SelectItem value="Ömer Bey">{t.responsiblePersons.omerBey}</SelectItem>
                  <SelectItem value="Av.İbrahim Bey">{t.responsiblePersons.avIbrahimBey}</SelectItem>
                  <SelectItem value="Av.Kenan Bey">{t.responsiblePersons.avKenanBey}</SelectItem>
                  <SelectItem value="İsmail Bey">{t.responsiblePersons.ismailBey}</SelectItem>
                  <SelectItem value="Ebru Hanım">{t.responsiblePersons.ebruHanim}</SelectItem>
                  <SelectItem value="Pınar Hanım">{t.responsiblePersons.pinarHanim}</SelectItem>
                  <SelectItem value="Yaren Hanım">{t.responsiblePersons.yarenHanim}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible_person">{t.executions.responsiblePersonFilter}</Label>
              <Select value={formData.responsible_person} onValueChange={(value) => handleChange('responsible_person', value)} name="responsible_person">
                <SelectTrigger>
                  <SelectValue placeholder={t.executions.selectResponsiblePerson} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Av.M.Şerif Bey">{t.responsiblePersons.avMSerifBey}</SelectItem>
                  <SelectItem value="Ömer Bey">{t.responsiblePersons.omerBey}</SelectItem>
                  <SelectItem value="Av.İbrahim Bey">{t.responsiblePersons.avIbrahimBey}</SelectItem>
                  <SelectItem value="Av.Kenan Bey">{t.responsiblePersons.avKenanBey}</SelectItem>
                  <SelectItem value="İsmail Bey">{t.responsiblePersons.ismailBey}</SelectItem>
                  <SelectItem value="Ebru Hanım">{t.responsiblePersons.ebruHanim}</SelectItem>
                  <SelectItem value="Pınar Hanım">{t.responsiblePersons.pinarHanim}</SelectItem>
                  <SelectItem value="Yaren Hanım">{t.responsiblePersons.yarenHanim}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_text">{t.executions.reminderText}</Label>
              <Textarea
                id="reminder_text"
                name="reminder_text"
                value={formData.reminder_text}
                onChange={(e) => handleChange('reminder_text', e.target.value)}
                placeholder={t.executions.enterReminderText}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t.executions.privateNotes}</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={t.executions.enterPrivateNotes}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate('/executions')}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={loading || clientsLoading || !formData.client_id}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? t.common.saving : clientsLoading ? `${t.executions.clientsLoading}${retryCount > 0 ? ` (${retryCount}/3)` : ''}` : (isEdit ? t.common.update : t.common.create)}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
