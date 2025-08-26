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
      window.location.reload()
    }
    throw new ApiError(response.status, errorText || response.statusText)
  }

  return response.json()
}

export const api = {
  clients: {
    getAll: () => apiRequest<Client[]>('/api/clients'),
    getById: (id: string) => apiRequest<Client>(`/api/clients/${id}`),
    create: (data: ClientCreate) => apiRequest<Client>('/api/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<{ message: string }>(`/api/clients/${id}`, {
      method: 'DELETE',
    }),
  },
  
  cases: {
    getAll: (params?: { status?: string; client_id?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.append('status', params.status)
      if (params?.client_id) searchParams.append('client_id', params.client_id)
      
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
  },
  
  dashboard: {
    getData: () => apiRequest<DashboardData>('/api/dashboard'),
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
}

import type { Client, ClientCreate, Case, CaseCreate, CaseUpdate, DashboardData } from '../types'

export type { Client, ClientCreate, Case, CaseCreate, CaseUpdate, DashboardData }
