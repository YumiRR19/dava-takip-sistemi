const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

const responseCache = new Map<string, unknown>()
const inFlightRequests = new Map<string, Promise<unknown>>()

// Last successful GET response for an endpoint; used to render instantly while fresh data loads.
export function peekCache<T>(endpoint: string): T | undefined {
  return responseCache.get(endpoint) as T | undefined
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isGet = !options.method || options.method.toUpperCase() === 'GET'
  if (!isGet) {
    const result = await rawApiRequest<T>(endpoint, options)
    responseCache.clear()
    return result
  }
  const canShare = !options.signal
  const pending = canShare ? inFlightRequests.get(endpoint) : undefined
  if (pending) return pending as Promise<T>
  const promise = rawApiRequest<T>(endpoint, options).then((data) => {
    responseCache.set(endpoint, data)
    return data
  }).finally(() => {
    if (canShare) inFlightRequests.delete(endpoint)
  })
  if (canShare) inFlightRequests.set(endpoint, promise)
  return promise
}

async function rawApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`
  const token = localStorage.getItem('auth_token')
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorText = await response.text()
      if (response.status === 401) {
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
      }
      let errorMessage = response.statusText
      try {
        const errorData = JSON.parse(errorText)
        const detail = errorData.detail
        if (typeof detail === 'string') {
          errorMessage = detail
        } else if (Array.isArray(detail) && detail.length > 0) {
          errorMessage = detail.map((e: any) => e.msg || String(e)).join(', ')
        } else if (detail) {
          errorMessage = String(detail)
        }
      } catch {
        errorMessage = errorText || errorMessage
      }
      console.error(`API Error ${response.status}:`, errorMessage)
      throw new ApiError(response.status, errorMessage)
    }

    return response.json()
  } catch (error) {
    console.error('API Request failed:', error)
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, 'Network error or server unavailable')
  }
}

export const request = apiRequest

export type CaseListParams = { status?: string; client_id?: string; query?: string; responsible_person?: string; görevlendiren?: string; kanun_yolu?: string; page?: number; limit?: number }

function casesEndpoint(params?: CaseListParams): string {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.append('status', params.status)
  if (params?.client_id) searchParams.append('client_id', params.client_id)
  if (params?.query) searchParams.append('query', params.query)
  if (params?.responsible_person) searchParams.append('responsible_person', params.responsible_person)
  if (params?.görevlendiren) searchParams.append('görevlendiren', params.görevlendiren)
  if (params?.kanun_yolu) searchParams.append('kanun_yolu', params.kanun_yolu)
  if (params?.page) searchParams.append('page', params.page.toString())
  searchParams.append('limit', (params?.limit ?? 10000).toString())
  
  const query = searchParams.toString()
  return `/api/cases${query ? `?${query}` : ''}`
}

export const api = {
  clients: {
    getAll: (options?: { signal?: AbortSignal }) => apiRequest<Client[]>('/api/clients?limit=10000', options),
    getById: (id: string) => apiRequest<Client>(`/api/clients/${id}`),
    create: (data: ClientCreate) => apiRequest<Client>('/api/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: ClientUpdate) => apiRequest<Client>(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<{ message: string }>(`/api/clients/${id}`, {
      method: 'DELETE',
    }),
  },
  
  cases: {
    peekAll: (params?: CaseListParams) => peekCache<Case[]>(casesEndpoint(params)),
    getAll: (params?: CaseListParams) => apiRequest<Case[]>(casesEndpoint(params)),
    getById: (id: string) => apiRequest<Case>(`/api/cases/${id}`),
    create: (data: CaseCreate) => apiRequest<Case>('/api/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: CaseUpdate) => apiRequest<Case>(`/api/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<{ message: string }>(`/api/cases/${id}`, {
      method: 'DELETE',
    }),
    search: (searchParams: CaseSearchParams) => {
      const urlParams = new URLSearchParams()
      if (searchParams.case_type) urlParams.append('case_type', searchParams.case_type)
      if (searchParams.status) urlParams.append('status', searchParams.status)
      if (searchParams.court) urlParams.append('court', searchParams.court)
      if (searchParams.client_id) urlParams.append('client_id', searchParams.client_id)
      if (searchParams.defendant) urlParams.append('q', searchParams.defendant)
      
      const query = urlParams.toString()
      return apiRequest<Case[]>(`/api/cases/search${query ? `?${query}` : ''}`)
    },
  },
  
  dashboard: {
    peekData: () => peekCache<DashboardData>('/api/dashboard'),
    getData: (params?: { reminder_date?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.reminder_date) searchParams.append('reminder_date', params.reminder_date)
      const query = searchParams.toString()
      return apiRequest<DashboardData>(`/api/dashboard${query ? `?${query}` : ''}`)
    },
  },
  
  reminders: {
    toggleStar: (entityType: string, entityId: string) => apiRequest<{ entity_type: string; entity_id: string; is_starred: boolean }>('/api/reminders/toggle-star', {
      method: 'POST',
      body: JSON.stringify({ entity_type: entityType, entity_id: entityId }),
    }),
  },
  
  auth: {
    changePassword: (currentPassword: string, newPassword: string) => 
      apiRequest<{ message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      }),
  },
  
  backup: {
    export: () => apiRequest<any>('/api/backup'),
    import: (data: any) => apiRequest<{ message: string }>('/api/restore', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
  
  compensationLetters: {
    getAll: (params?: { status?: string; client_id?: string; responsible_person?: string; görevlendiren?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.append('status', params.status)
      if (params?.client_id) searchParams.append('client_id', params.client_id)
      if (params?.responsible_person) searchParams.append('responsible_person', params.responsible_person)
      if (params?.görevlendiren) searchParams.append('görevlendiren', params.görevlendiren)
      searchParams.append('limit', '10000')
      
      const query = searchParams.toString()
      return apiRequest<CompensationLetter[]>(`/api/compensation-letters${query ? `?${query}` : ''}`)
    },
    getById: (id: string) => apiRequest<CompensationLetter>(`/api/compensation-letters/${id}`),
    create: (data: CompensationLetterCreate) => apiRequest<CompensationLetter>('/api/compensation-letters', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: CompensationLetterUpdate) => apiRequest<CompensationLetter>(`/api/compensation-letters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<{ message: string }>(`/api/compensation-letters/${id}`, {
      method: 'DELETE',
    }),
  },

  executions: {
    peekAll: () => peekCache<Execution[]>('/api/executions?limit=10000'),
    getAll: (params?: { status?: string; client_id?: string; responsible_person?: string; görevlendiren?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.append('status', params.status)
      if (params?.client_id) searchParams.append('client_id', params.client_id)
      if (params?.responsible_person) searchParams.append('responsible_person', params.responsible_person)
      if (params?.görevlendiren) searchParams.append('görevlendiren', params.görevlendiren)
      searchParams.append('limit', '10000')
      
      const query = searchParams.toString()
      return apiRequest<Execution[]>(`/api/executions${query ? `?${query}` : ''}`)
    },
    getById: (id: string) => apiRequest<Execution>(`/api/executions/${id}`),
    create: (data: ExecutionCreate) => apiRequest<Execution>('/api/executions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: ExecutionUpdate) => apiRequest<Execution>(`/api/executions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<{ message: string }>(`/api/executions/${id}`, {
      method: 'DELETE',
    }),
  },

  importantReminders: {
    getAll: () => apiRequest<ImportantReminder[]>('/api/important-reminders'),
    peekAll: () => peekCache<ImportantReminder[]>('/api/important-reminders'),
    create: (data: ImportantReminderCreate) => apiRequest<ImportantReminder>('/api/important-reminders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: ImportantReminderUpdate) => apiRequest<ImportantReminder>(`/api/important-reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<{ message: string }>(`/api/important-reminders/${id}`, {
      method: 'DELETE',
    }),
  },

  archiveSuggestion: (court: string) =>
    apiRequest<{ suggestion: string | null; last_number?: number; prefix?: string }>(`/api/case-archive-suggestion?court=${encodeURIComponent(court)}`),

  settingsOptions: {
    peekAll: (category?: string) => peekCache<SettingsOption[]>(`/api/settings/options${category ? `?category=${category}` : ''}`),
    getAll: (category?: string) => {
      const params = category ? `?category=${category}` : ''
      return apiRequest<SettingsOption[]>(`/api/settings/options${params}`)
    },
    create: (data: SettingsOptionCreate) => apiRequest<SettingsOption>('/api/settings/options', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<{ message: string }>(`/api/settings/options/${id}`, {
      method: 'DELETE',
    }),
  },
}

export interface SettingsOption {
  id: string
  category: string
  value: string
  created_at: string
}

export interface SettingsOptionCreate {
  category: string
  value: string
}

import type { Client, ClientCreate, ClientUpdate, Case, CaseCreate, CaseUpdate, DashboardData, CaseSearchParams, CompensationLetter, CompensationLetterCreate, CompensationLetterUpdate, Execution, ExecutionCreate, ExecutionUpdate } from '../types'

export type { Client, ClientCreate, ClientUpdate, Case, CaseCreate, CaseUpdate, DashboardData, CaseSearchParams, CompensationLetter, CompensationLetterCreate, CompensationLetterUpdate, Execution, ExecutionCreate, ExecutionUpdate }

export interface ImportantReminder {
  id: string
  responsible_person?: string | null
  görevlendiren?: string | null
  reminder_date?: string | null
  reminder_text?: string | null
  is_starred: boolean
  created_at?: string
  updated_at?: string
  version: number
}

export interface ImportantReminderCreate {
  responsible_person?: string | null
  görevlendiren?: string | null
  reminder_date?: string | null
  reminder_text?: string | null
  is_starred?: boolean
}

export interface ImportantReminderUpdate extends ImportantReminderCreate {
  version?: number
}
