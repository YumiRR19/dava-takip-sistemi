export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  created_at: string
}

export interface ClientCreate {
  name: string
  email: string
  phone: string
  address: string
}

export interface Case {
  id: string
  title: string
  description: string
  client_id: string
  client_name: string
  case_type: string
  status: string
  court: string
  case_number: string
  start_date: string
  next_hearing_date?: string
  created_at: string
  updated_at: string
}

export interface CaseCreate {
  title: string
  description: string
  client_id: string
  case_type: string
  status: string
  court: string
  case_number: string
  start_date: string
  next_hearing_date?: string
}

export interface CaseUpdate {
  title?: string
  description?: string
  case_type?: string
  status?: string
  court?: string
  case_number?: string
  start_date?: string
  next_hearing_date?: string
}

export interface DashboardData {
  total_cases: number
  total_clients: number
  status_counts: Record<string, number>
  upcoming_hearings: Array<{
    case_id: string
    case_title: string
    client_name: string
    hearing_date: string
    court: string
  }>
}
