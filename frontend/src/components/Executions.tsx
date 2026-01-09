import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api, Execution } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Executions() {
  const [executions, setExecutions] = useState<Execution[]>([])
  const [filteredExecutions, setFilteredExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [hacizFilter, setHacizFilter] = useState<string>('all')
  const [responsiblePersonFilter, setResponsiblePersonFilter] = useState<string>('all')
  const [görevlendirenFilter, setGörevlendirenFilter] = useState<string>('all')
  const [executionTypeFilter, setExecutionTypeFilter] = useState<string>('all')
  const { toast } = useToast()
  const navigate = useNavigate()
  const { t, language } = useLanguage()

  useEffect(() => {
    loadExecutions()
  }, [])

  useEffect(() => {
    filterExecutions()
  }, [executions, searchTerm, statusFilter, hacizFilter, responsiblePersonFilter, görevlendirenFilter, executionTypeFilter])

  const getDateLocale = () => {
    if (language === 'tr') return 'tr-TR'
    if (language === 'de') return 'de-DE'
    return 'en-US'
  }

  const loadExecutions = async () => {
    try {
      const executionsData = await api.executions.getAll()
      setExecutions(executionsData)
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.executions.executionsLoadError,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterExecutions = () => {
    let filtered = executions

    if (searchTerm) {
      filtered = filtered.filter(execution => 
        execution.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        execution.defendant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        execution.execution_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(execution => execution.status === statusFilter)
    }

    if (hacizFilter !== 'all') {
      filtered = filtered.filter(execution => execution.haciz_durumu === hacizFilter)
    }

    if (responsiblePersonFilter !== 'all') {
      filtered = filtered.filter(execution => execution.responsible_person === responsiblePersonFilter)
    }

    if (görevlendirenFilter !== 'all') {
      filtered = filtered.filter(execution => (execution as any).görevlendiren === görevlendirenFilter)
    }

    if (executionTypeFilter !== 'all') {
      filtered = filtered.filter(execution => execution.execution_type === executionTypeFilter)
    }

    setFilteredExecutions(filtered)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t.executions.confirmDelete)) {
      return
    }

    try {
      await api.executions.delete(id)
      toast({
        title: t.common.success,
        description: t.executions.executionDeleted,
      })
      loadExecutions()
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.executions.executionDeleteError,
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Derdest':
        return 'default'
      case 'İnfaz':
        return 'destructive'
      case 'Haricen Tahsil':
        return 'destructive'
      case 'İtirazlı':
        return 'outline'
      case 'İcranın Geri Bırakılması':
        return 'secondary'
      case 'Davalı':
        return 'default'
      case 'Ödeme Sözü':
        return 'secondary'
      case 'Bilirkişi':
        return 'outline'
      default:
        return 'default'
    }
  }

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
        <h1 className="text-3xl font-bold text-gray-900">{t.executions.title}</h1>
        <Button asChild>
          <Link to="/executions/new">
            <Plus className="h-4 w-4 mr-2" />
            {t.executions.newExecution}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.executions.executionList}</CardTitle>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t.executions.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <CardDescription>
            {t.executions.viewAndManageExecutions}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t.executions.statusFilter} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.executions.allStatuses}</SelectItem>
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

            <Select value={executionTypeFilter} onValueChange={setExecutionTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t.executions.executionTypeFilter} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.executions.allExecutionTypes}</SelectItem>
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
            <Select value={hacizFilter} onValueChange={setHacizFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t.executions.seizureStatusFilter} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.executions.allSeizureStatuses}</SelectItem>
                <SelectItem value="Hacizli Araç">{t.seizureStatuses.seizedVehicle}</SelectItem>
                <SelectItem value="Rehinli Araç">{t.seizureStatuses.pledgedVehicle}</SelectItem>
                <SelectItem value="Yakalamalı / Şatış">{t.seizureStatuses.wantedForSale}</SelectItem>
                <SelectItem value="İpotekli / Gayrimenkul">{t.seizureStatuses.mortgagedRealEstate}</SelectItem>
                <SelectItem value="Hacizli / Gayrimenkul">{t.seizureStatuses.seizedRealEstate}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={responsiblePersonFilter} onValueChange={setResponsiblePersonFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t.executions.responsiblePersonFilter} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.executions.allResponsiblePersons}</SelectItem>
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
            <Select value={görevlendirenFilter} onValueChange={setGörevlendirenFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t.executions.assignedByFilter} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.executions.allAssignedBy}</SelectItem>
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

          <div className="overflow-x-auto">
            <div className="rounded-md border">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.executions.execution}</TableHead>
                  <TableHead>{t.executions.executionFileNo}</TableHead>
                  <TableHead>{t.executions.client}</TableHead>
                  <TableHead>{t.executions.defendant}</TableHead>
                  <TableHead>{t.executions.status}</TableHead>
                  <TableHead>{t.executions.seizureStatus}</TableHead>
                  <TableHead>{t.executions.openingDate}</TableHead>
                  <TableHead>{t.executions.reminder}</TableHead>
                  <TableHead className="text-right">{t.executions.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExecutions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      {statusFilter !== 'all' || hacizFilter !== 'all' || responsiblePersonFilter !== 'all' || görevlendirenFilter !== 'all' || executionTypeFilter !== 'all' ? t.executions.noExecutionsMatchingCriteria : t.executions.noExecutionsFound}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExecutions.map((execution) => (
                    <TableRow key={execution.id}>
                      <TableCell className="font-medium">{execution.execution_office}</TableCell>
                      <TableCell>{execution.execution_number}</TableCell>
                      <TableCell>{execution.client_name}</TableCell>
                      <TableCell>{execution.defendant}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(execution.status)}>
                          {execution.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {execution.haciz_durumu ? (
                          <Badge variant="outline">
                            {execution.haciz_durumu}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(execution.start_date).toLocaleDateString(getDateLocale())}
                      </TableCell>
                      <TableCell>
                        {execution.reminder_date ? (
                          <div className="text-sm">
                            <div className="font-medium text-red-600">
                              {new Date(execution.reminder_date).toLocaleDateString(getDateLocale())}
                            </div>
                            {execution.reminder_text && (
                              <div className="text-gray-500 truncate max-w-32">
                                {execution.reminder_text}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/executions/${execution.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(execution.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
