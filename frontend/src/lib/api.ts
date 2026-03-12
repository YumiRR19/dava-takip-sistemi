const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
        errorMessage = errorData.detail || errorMessage
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

export const api = {
  clients: {
    getAll: (options?: { signal?: AbortSignal }) => apiRequest<Client[]>('/api/clients', options),
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
    getAll: (params?: { status?: string; client_id?: string; query?: string; responsible_person?: string; görevlendiren?: string; page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.append('status', params.status)
      if (params?.client_id) searchParams.append('client_id', params.client_id)
      if (params?.query) searchParams.append('query', params.query)
      if (params?.responsible_person) searchParams.append('responsible_person', params.responsible_person)
      if (params?.görevlendiren) searchParams.append('görevlendiren', params.görevlendiren)
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      
      const query = searchParams.toString()
      return apiRequest<Case[]>(`/api/cases${query ? `?${query}` : ''}`)
    },
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
    getAll: (params?: { status?: string; client_id?: string; görevlendiren?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.append('status', params.status)
      if (params?.client_id) searchParams.append('client_id', params.client_id)
      if (params?.görevlendiren) searchParams.append('görevlendiren', params.görevlendiren)
      
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
    getAll: (params?: { status?: string; client_id?: string; responsible_person?: string; görevlendiren?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.append('status', params.status)
      if (params?.client_id) searchParams.append('client_id', params.client_id)
      if (params?.responsible_person) searchParams.append('responsible_person', params.responsible_person)
      if (params?.görevlendiren) searchParams.append('görevlendiren', params.görevlendiren)
      
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
}

import type { Client, ClientCreate, ClientUpdate, Case, CaseCreate, CaseUpdate, DashboardData, CaseSearchParams, CompensationLetter, CompensationLetterCreate, CompensationLetterUpdate, Execution, ExecutionCreate, ExecutionUpdate } from '../types'

export type { Client, ClientCreate, ClientUpdate, Case, CaseCreate, CaseUpdate, DashboardData, CaseSearchParams, CompensationLetter, CompensationLetterCreate, CompensationLetterUpdate, Execution, ExecutionCreate, ExecutionUpdate }
