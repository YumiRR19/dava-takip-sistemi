import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  FileText, 
  Users, 
  Menu, 
  X,
  Scale,
  Settings,
  Mail
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

const navigation = [
  { name: 'Anasayfa', href: '/', icon: Home },
  { name: 'Dava Dosyaları', href: '/cases', icon: FileText },
  { name: 'İcra Takipleri', href: '/executions', icon: Scale },
  { name: 'Teminat Mektupları', href: '/compensation-letters', icon: Mail },
  { name: 'Müvekkiller', href: '/clients', icon: Users },
  { name: 'Ayarlar', href: '/settings', icon: Settings },
]

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      <div className={cn(
        "fixed inset-0 z-50 bg-gray-900/80 lg:hidden",
        open ? "block" : "hidden"
      )} onClick={() => setOpen(false)} />
      
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Scale className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">LexCloud</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  )}
                  onClick={() => setOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
      
      <div className="lg:hidden">
        <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <Scale className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">LexCloud</span>
          </div>
          <div className="w-10" />
        </div>
      </div>
    </>
  )
}
