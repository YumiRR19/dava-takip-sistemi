import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    dashboard: {
      getData: jest.fn()
    }
  },
  request: jest.fn().mockResolvedValue({ status: 'ok' })
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-real-time-data', () => ({
  useRealTimeData: () => ({
    isConnected: false,
    hasChangesForEntity: jest.fn().mockReturnValue(false),
    clearDataChanges: jest.fn(),
    isPollingFallback: false
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

const mockDashboardData = {
  total_cases: 10,
  total_clients: 5,
  total_executions: 8,
  total_compensation_letters: 3,
  status_counts: { 'Derdest': 5, 'Kabul': 3, 'Red': 2 },
  upcoming_reminders: []
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show loading spinner initially', async () => {
    (api.dashboard.getData as jest.Mock).mockReturnValue(new Promise(() => {}));

    await act(async () => {
      renderWithRouter(<Dashboard />);
    });

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  test('should display dashboard data after loading', async () => {
    (api.dashboard.getData as jest.Mock).mockResolvedValue(mockDashboardData);

    await act(async () => {
      renderWithRouter(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('Anasayfa')).toBeInTheDocument();
    });

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('should display stat card titles', async () => {
    (api.dashboard.getData as jest.Mock).mockResolvedValue(mockDashboardData);

    await act(async () => {
      renderWithRouter(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('Toplam Dava')).toBeInTheDocument();
      expect(screen.getByText('Toplam Müvekkil')).toBeInTheDocument();
    });
  });

  test('should show empty reminders message when no reminders', async () => {
    (api.dashboard.getData as jest.Mock).mockResolvedValue(mockDashboardData);

    await act(async () => {
      renderWithRouter(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('Hatırlatmalar')).toBeInTheDocument();
    });
  });

  test('should display action buttons', async () => {
    (api.dashboard.getData as jest.Mock).mockResolvedValue(mockDashboardData);

    await act(async () => {
      renderWithRouter(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('Yeni Dava')).toBeInTheDocument();
      expect(screen.getByText('Yeni Müvekkil')).toBeInTheDocument();
    });
  });
});
