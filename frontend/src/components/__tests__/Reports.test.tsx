import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Reports from '../Reports';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    reports: {
      getData: jest.fn()
    }
  }
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

const mockReportsData = {
  totals: {
    cases: 25,
    executions: 15,
    compensation_letters: 10,
    clients: 20
  },
  case_status_counts: {
    'Derdest': 10,
    'Kabul': 5,
    'Red': 3,
    'Temyiz': 7
  },
  execution_status_counts: {
    'Devam Ediyor': 8,
    'Tamamlandi': 7
  },
  letter_status_counts: {
    'Aktif': 6,
    'Pasif': 4
  },
  monthly_trends: [
    { month: '2024-01', cases: 5, executions: 3, compensation_letters: 2 },
    { month: '2024-02', cases: 8, executions: 4, compensation_letters: 3 },
    { month: '2024-03', cases: 12, executions: 8, compensation_letters: 5 }
  ],
  responsible_person_counts: {
    'Av.M.Serif Bey': 10,
    'Omer Bey': 5
  },
  case_type_counts: {
    'Hukuk': 15,
    'Ceza': 10
  },
  court_counts: {
    'Istanbul 1. Asliye': 8,
    'Ankara 3. Ceza': 5
  }
};

describe('Reports Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show loading spinner initially', async () => {
    (api.reports.getData as jest.Mock).mockReturnValue(new Promise(() => {}));

    await act(async () => {
      renderWithRouter(<Reports />);
    });

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  test('should display reports data after loading', async () => {
    (api.reports.getData as jest.Mock).mockResolvedValue(mockReportsData);

    await act(async () => {
      renderWithRouter(<Reports />);
    });

    await waitFor(() => {
      expect(screen.getByText('Raporlar & Analizler')).toBeInTheDocument();
    });

    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  test('should display summary cards with correct titles', async () => {
    (api.reports.getData as jest.Mock).mockResolvedValue(mockReportsData);

    await act(async () => {
      renderWithRouter(<Reports />);
    });

    await waitFor(() => {
      expect(screen.getByText('Toplam Dava')).toBeInTheDocument();
      expect(screen.getByText('Toplam Icra Takipleri')).toBeInTheDocument();
      expect(screen.getByText('Toplam Teminat Mektuplari')).toBeInTheDocument();
      expect(screen.getByText('Toplam Muvekkil')).toBeInTheDocument();
    });
  });

  test('should display chart sections', async () => {
    (api.reports.getData as jest.Mock).mockResolvedValue(mockReportsData);

    await act(async () => {
      renderWithRouter(<Reports />);
    });

    await waitFor(() => {
      expect(screen.getByText('Aylik Trendler')).toBeInTheDocument();
      expect(screen.getByText('Dava Durumlari Dagilimi')).toBeInTheDocument();
      expect(screen.getByText('Icra Takip Durumlari')).toBeInTheDocument();
      expect(screen.getByText('Sorumlu Kisi Dagilimi')).toBeInTheDocument();
      expect(screen.getByText('Dava Turleri')).toBeInTheDocument();
    });
  });

  test('should show error state when API fails', async () => {
    (api.reports.getData as jest.Mock).mockRejectedValue(new Error('API Error'));

    await act(async () => {
      renderWithRouter(<Reports />);
    });

    await waitFor(() => {
      expect(screen.getByText('Rapor verileri yuklenemedi.')).toBeInTheDocument();
    });
  });

  test('should show empty state when no data', async () => {
    const emptyData = {
      totals: { cases: 0, executions: 0, compensation_letters: 0, clients: 0 },
      case_status_counts: {},
      execution_status_counts: {},
      letter_status_counts: {},
      monthly_trends: [],
      responsible_person_counts: {},
      case_type_counts: {},
      court_counts: {}
    };

    (api.reports.getData as jest.Mock).mockResolvedValue(emptyData);

    await act(async () => {
      renderWithRouter(<Reports />);
    });

    await waitFor(() => {
      expect(screen.getByText('Henuz rapor verisi bulunmuyor.')).toBeInTheDocument();
    });
  });
});
