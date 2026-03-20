# LexCloud Frontend

React + TypeScript frontend for the LexCloud case tracking system (Dava Takip Sistemi).

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v7
- **Testing**: Jest + React Testing Library

## Features

- **Dashboard**: Overview with stats, real-time reminders, and system health indicators
- **Case Management**: Full CRUD for legal cases with status tracking, court info, reminders
- **Execution Tracking**: Manage enforcement proceedings with filtering and search
- **Compensation Letters**: Track bank guarantee letters
- **Client Management**: Manage client information with contact details
- **Reports & Analytics**: Interactive charts showing:
  - Monthly trends (bar charts)
  - Case status distribution (pie charts)
  - Execution status distribution
  - Responsible person workload
  - Case type breakdown
  - Court distribution (top 10)
- **Settings**: Password management, backup/restore, theme switching
- **Real-time Updates**: WebSocket-based live data synchronization with polling fallback
- **Responsive Design**: Mobile-friendly with collapsible sidebar
- **PDF Export**: Generate PDF documents (via jsPDF)
- **Form Auto-save**: Draft recovery for unsaved form data

## Setup

### Prerequisites
- Node.js 20+
- npm

### Environment Variables
```env
VITE_API_URL=http://localhost:8000
```

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Running Tests
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting
```bash
npm run lint
```

## Project Structure
```
frontend/
  src/
    components/
      ui/             # shadcn/ui components
      __tests__/      # Component tests
      Dashboard.tsx   # Main dashboard with stats & reminders
      Cases.tsx       # Case listing page
      CaseForm.tsx    # Case create/edit form
      Clients.tsx     # Client listing page
      ClientForm.tsx  # Client create/edit form
      Executions.tsx  # Execution listing page
      ExecutionForm.tsx
      CompensationLetters.tsx
      CompensationLetterForm.tsx
      Reports.tsx     # Analytics & charts page
      Login.tsx       # Authentication page
      Settings.tsx    # App settings
      Sidebar.tsx     # Navigation sidebar
    contexts/
      AuthContext.tsx  # Authentication state management
    hooks/
      use-toast.ts           # Toast notifications
      use-real-time-data.ts  # WebSocket data sync
      use-websocket.ts       # WebSocket connection
      use-polling-fallback.ts
      use-debounced-search.ts
      use-form-autosave.ts
      use-before-unload.ts
    lib/
      api.ts          # API client with typed endpoints
      utils.ts        # Utility functions
    types/
      index.ts        # TypeScript type definitions
    App.tsx           # Main app with routing
    main.tsx          # Entry point
```
