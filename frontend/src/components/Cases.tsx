import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { api, Case } from '@/lib/api'
import { useRealTimeData } from '@/hooks/use-real-time-data'
import { useDebouncedSearch } from '@/hooks/use-debounced-search'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Cases() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [responsiblePersonFilter, setResponsiblePersonFilter] = useState<string>('')
  const [görevlendirenFilter, setGörevlendirenFilter] = useState<string>('')
  const { toast } = useToast()
  const { hasChangesForEntity, clearDataChanges } = useRealTimeData()
  const debouncedSearchTerm = useDebouncedSearch(searchTerm, 300)
  const { t, language } = useLanguage()

  useEffect(() => {
    loadCases()
  }, [statusFilter, responsiblePersonFilter, görevlendirenFilter, debouncedSearchTerm])

  useEffect(() => {
    if (hasChangesForEntity('case')) {
      loadCases()
      clearDataChanges()
    }
  }, [hasChangesForEntity, clearDataChanges])

  const getDateLocale = () => {
    if (language === 'tr') return 'tr-TR'
    if (language === 'de') return 'de-DE'
    return 'en-US'
  }

  const loadCases = async () => {
    try {
      const params: any = {}
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter
      }
      if (responsiblePersonFilter && responsiblePersonFilter !== 'all') {
        params.responsible_person = responsiblePersonFilter
      }
      if (görevlendirenFilter && görevlendirenFilter !== 'all') {
        params.görevlendiren = görevlendirenFilter
      }
      if (debouncedSearchTerm) {
        params.query = debouncedSearchTerm
      }
      const casesData = await api.cases.getAll(params)
      setCases(casesData)
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.cases.casesLoadError,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (caseId: string) => {
    if (!confirm(t.cases.confirmDelete)) {
      return
    }

    try {
      await api.cases.delete(caseId)
      setCases(cases.filter(c => c.id !== caseId))
      toast({
        title: t.common.success,
        description: t.cases.caseDeleted,
      })
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.cases.caseDeleteError,
        variant: "destructive",
      })
    }
  }

  const filteredCases = cases.filter(caseItem =>
    caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (caseItem.case_name && caseItem.case_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (caseItem.defendant && caseItem.defendant.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <h1 className="text-3xl font-bold text-gray-900">{t.cases.title}</h1>
        <Button asChild>
          <Link to="/cases/new">
            <Plus className="h-4 w-4 mr-2" />
            {t.cases.newCase}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t.cases.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t.cases.statusFilter} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.cases.allStatuses}</SelectItem>
            <SelectItem value="Beraat">{t.caseStatuses.acquittal}</SelectItem>
            <SelectItem value="Ceza">{t.caseStatuses.penalty}</SelectItem>
            <SelectItem value="Kısmen Kabul Kısmen Red">{t.caseStatuses.partialAcceptPartialReject}</SelectItem>
            <SelectItem value="Kabul">{t.caseStatuses.accepted}</SelectItem>
            <SelectItem value="Red">{t.caseStatuses.rejected}</SelectItem>
            <SelectItem value="Temyiz">{t.caseStatuses.appeal}</SelectItem>
            <SelectItem value="İstinaf">{t.caseStatuses.regionalAppeal}</SelectItem>
            <SelectItem value="Derdest">{t.caseStatuses.pending}</SelectItem>
            <SelectItem value="Kesinleştirme">{t.caseStatuses.finalization}</SelectItem>
            <SelectItem value="Gerekli Karar Bekleniyor">{t.caseStatuses.awaitingDecision}</SelectItem>
            <SelectItem value="Bilirkişi">{t.caseStatuses.expert}</SelectItem>
            <SelectItem value="Konkordato">{t.caseStatuses.concordat}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={responsiblePersonFilter} onValueChange={setResponsiblePersonFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t.cases.responsiblePersonFilter} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.cases.allResponsiblePersons}</SelectItem>
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
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t.cases.assignedByFilter} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.cases.allAssignedBy}</SelectItem>
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

      {filteredCases.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm || (statusFilter && statusFilter !== 'all') || (responsiblePersonFilter && responsiblePersonFilter !== 'all') || (görevlendirenFilter && görevlendirenFilter !== 'all') ? t.cases.noCasesMatchingCriteria : t.cases.noCasesFound}
            </p>
            {!searchTerm && (!statusFilter || statusFilter === 'all') && (!responsiblePersonFilter || responsiblePersonFilter === 'all') && (!görevlendirenFilter || görevlendirenFilter === 'all') && (
              <Button asChild className="mt-4">
                <Link to="/cases/new">{t.cases.createFirstCase}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.cases.court}</TableHead>
                    <TableHead>{t.cases.fileNo}</TableHead>
                    <TableHead>{t.cases.client}</TableHead>
                    <TableHead>{t.cases.defendant}</TableHead>
                    <TableHead>{t.cases.caseName}</TableHead>
                    <TableHead>{t.cases.reminderDate}</TableHead>
                    <TableHead>{t.cases.reminderText}</TableHead>
                    <TableHead>{t.cases.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">{caseItem.court}</TableCell>
                      <TableCell>{caseItem.case_number}</TableCell>
                      <TableCell>{caseItem.client_name}</TableCell>
                      <TableCell>{caseItem.defendant}</TableCell>
                      <TableCell>{caseItem.case_name || '-'}</TableCell>
                      <TableCell>
                        {caseItem.reminder_date 
                          ? new Date(caseItem.reminder_date).toLocaleDateString(getDateLocale())
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{caseItem.description || '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/cases/${caseItem.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(caseItem.id)}
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
