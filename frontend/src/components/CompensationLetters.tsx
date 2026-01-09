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
import { useLanguage } from '@/contexts/LanguageContext'

export default function CompensationLetters() {
  const [letters, setLetters] = useState<CompensationLetter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [responsiblePersonFilter, setResponsiblePersonFilter] = useState<string>('')
  const [görevlendirenFilter, setGörevlendirenFilter] = useState<string>('')
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    loadLetters()
  }, [statusFilter, responsiblePersonFilter, görevlendirenFilter])

  const loadLetters = async () => {
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
      const lettersData = await api.compensationLetters.getAll(Object.keys(params).length > 0 ? params : undefined)
      setLetters(lettersData)
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.compensationLetters.lettersLoadError,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (letterId: string) => {
    if (!confirm(t.compensationLetters.confirmDelete)) {
      return
    }

    try {
      await api.compensationLetters.delete(letterId)
      setLetters(letters.filter(l => l.id !== letterId))
      toast({
        title: t.common.success,
        description: t.compensationLetters.letterDeleted,
      })
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.compensationLetters.letterDeleteError,
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
        <h1 className="text-3xl font-bold text-gray-900">{t.compensationLetters.title}</h1>
        <Button asChild>
          <Link to="/compensation-letters/new">
            <Plus className="h-4 w-4 mr-2" />
            {t.compensationLetters.newLetter}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t.compensationLetters.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t.compensationLetters.statusFilter} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.compensationLetters.allStatuses}</SelectItem>
            <SelectItem value="İADE">{t.compensationLetterStatuses.returned}</SelectItem>
            <SelectItem value="İADE İSTENDİ">{t.compensationLetterStatuses.returnRequested}</SelectItem>
            <SelectItem value="DEVAM EDİYOR">{t.compensationLetterStatuses.ongoing}</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Select value={responsiblePersonFilter} onValueChange={setResponsiblePersonFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t.compensationLetters.responsiblePersonFilter} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.compensationLetters.allResponsiblePersons}</SelectItem>
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
              <SelectValue placeholder={t.compensationLetters.assignedByFilter} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.compensationLetters.allAssignedBy}</SelectItem>
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
      </div>

      {filteredLetters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm || (statusFilter && statusFilter !== 'all') || (responsiblePersonFilter && responsiblePersonFilter !== 'all') || (görevlendirenFilter && görevlendirenFilter !== 'all') ? t.compensationLetters.noLettersMatchingCriteria : t.compensationLetters.noLettersFound}
            </p>
            {!searchTerm && (!statusFilter || statusFilter === 'all') && (!responsiblePersonFilter || responsiblePersonFilter === 'all') && (!görevlendirenFilter || görevlendirenFilter === 'all') && (
              <Button asChild className="mt-4">
                <Link to="/compensation-letters/new">{t.compensationLetters.createFirstLetter}</Link>
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
                  <TableHead>{t.compensationLetters.letterNo}</TableHead>
                  <TableHead>{t.compensationLetters.bank}</TableHead>
                  <TableHead>{t.compensationLetters.customerNo}</TableHead>
                  <TableHead>{t.compensationLetters.customer}</TableHead>
                  <TableHead>{t.compensationLetters.court}</TableHead>
                  <TableHead>{t.compensationLetters.fileNo}</TableHead>
                  <TableHead>{t.compensationLetters.status}</TableHead>
                  <TableHead>{t.compensationLetters.actions}</TableHead>
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
