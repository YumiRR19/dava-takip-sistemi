export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  tax_id?: string
  created_at: string
  updated_at: string
  version: number
}

export interface ClientCreate {
  name: string
  email: string
  phone: string
  address: string
  tax_id?: string
}

export interface ClientUpdate {
  name?: string
  email?: string
  phone?: string
  address?: string
  tax_id?: string
  version?: number
}

export interface Case {
  id: string
  title: string
  case_name?: string
  description?: string
  client_id: string
  client_name: string
  case_type: string
  status: string
  court: string
  case_number: string
  defendant: string
  notes?: string
  start_date: string
  next_hearing_date?: string
  reminder_date?: string
  office_archive_no: string
  responsible_person?: string
  created_at: string
  updated_at: string
  version: number
}

export interface CaseCreate {
  title: string
  case_name?: string
  description?: string
  client_id: string
  case_type: string
  status: string
  court: string
  case_number: string
  defendant: string
  notes?: string
  start_date: string
  next_hearing_date?: string
  reminder_date?: string
  office_archive_no: string
  responsible_person?: string
}

export interface CaseUpdate {
  title?: string
  case_name?: string
  description?: string
  case_type?: string
  status?: string
  court?: string
  case_number?: string
  defendant?: string
  notes?: string
  start_date?: string
  next_hearing_date?: string
  reminder_date?: string
  office_archive_no?: string
  responsible_person?: string
  version?: number
}

export interface CaseSearchParams {
  case_type?: string
  status?: string
  court?: string
  client_id?: string
  start_date_from?: string
  start_date_to?: string
}

export interface DashboardData {
  total_cases: number
  total_clients: number
  status_counts: Record<string, number>
  upcoming_hearings: Array<{
    case_id: string
    case_title: string
    case_number: string
    client_name: string
    hearing_date: string
    court: string
    defendant: string
  }>
  upcoming_reminders: Array<{
    type: 'case' | 'execution' | 'compensation_letter'
    case_id?: string
    case_title?: string
    case_name?: string
    case_number?: string
    execution_id?: string
    execution_number?: string
    execution_office?: string
    compensation_letter_id?: string
    letter_number?: string
    customer?: string
    client_name: string
    reminder_date: string
    court?: string
    status?: string
    defendant?: string
    description?: string
    reminder_text?: string
    responsible_person?: string
  }>
}

export interface CompensationLetter {
  id: string
  title: string
  client_id: string
  client_name: string
  letter_number: string
  bank: string
  customer_number: string
  customer: string
  court: string
  case_number: string
  status: string
  description_text?: string
  reminder_date?: string
  reminder_text?: string
  responsible_person?: string
  created_at: string
  updated_at: string
  version: number
}

export interface CompensationLetterCreate {
  client_id: string
  letter_number: string
  bank: string
  customer_number: string
  customer: string
  court: string
  case_number: string
  status: string
  description_text?: string
  reminder_date?: string
  reminder_text?: string
  responsible_person?: string
}

export interface CompensationLetterUpdate {
  client_id?: string
  letter_number?: string
  bank?: string
  customer_number?: string
  customer?: string
  court?: string
  case_number?: string
  status?: string
  description_text?: string
  reminder_date?: string
  reminder_text?: string
  responsible_person?: string
  version?: number
}

export interface Execution {
  id: string
  client_id: string
  client_name: string
  defendant: string
  execution_office: string
  execution_number: string
  status: string
  execution_type: string
  start_date: string
  office_archive_no: string
  reminder_date?: string
  reminder_text?: string
  notes?: string
  haciz_durumu?: string
  responsible_person?: string
  created_at: string
  updated_at: string
  version: number
}

export interface ExecutionCreate {
  client_id: string
  defendant: string
  execution_office: string
  execution_number: string
  status: string
  execution_type: string
  start_date: string
  office_archive_no: string
  reminder_date?: string
  reminder_text?: string
  notes?: string
  haciz_durumu?: string
  responsible_person?: string
}

export interface ExecutionUpdate {
  defendant?: string
  execution_office?: string
  execution_number?: string
  status?: string
  start_date?: string
  office_archive_no?: string
  reminder_date?: string
  reminder_text?: string
  notes?: string
  haciz_durumu?: string
  responsible_person?: string
  version?: number
}
