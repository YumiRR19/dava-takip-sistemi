import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Cases from './components/Cases'
import Clients from './components/Clients'
import CaseForm from './components/CaseForm'
import ClientForm from './components/ClientForm'
import CompensationLetters from './components/CompensationLetters'
import CompensationLetterForm from './components/CompensationLetterForm'
import Executions from './components/Executions'
import ExecutionForm from './components/ExecutionForm'
import Login from './components/Login'
import Settings from './components/Settings'
import './App.css'

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/new" element={<CaseForm />} />
            <Route path="/cases/:id/edit" element={<CaseForm />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/new" element={<ClientForm />} />
            <Route path="/clients/edit/:id" element={<ClientForm />} />
            <Route path="/executions" element={<Executions />} />
            <Route path="/executions/new" element={<ExecutionForm />} />
            <Route path="/executions/:id/edit" element={<ExecutionForm />} />
            <Route path="/compensation-letters" element={<CompensationLetters />} />
            <Route path="/compensation-letters/new" element={<CompensationLetterForm />} />
            <Route path="/compensation-letters/:id/edit" element={<CompensationLetterForm />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
      
      <Toaster />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
