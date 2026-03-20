import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../Sidebar';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Sidebar Component', () => {
  const mockSetOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render sidebar with LexCloud branding', () => {
    renderWithRouter(<Sidebar open={false} setOpen={mockSetOpen} />);
    
    const brandElements = screen.getAllByText('LexCloud');
    expect(brandElements.length).toBeGreaterThan(0);
  });

  test('should render all navigation items', () => {
    renderWithRouter(<Sidebar open={true} setOpen={mockSetOpen} />);

    expect(screen.getByText('Anasayfa')).toBeInTheDocument();
    expect(screen.getByText('Dava Dosyaları')).toBeInTheDocument();
    expect(screen.getByText('İcra Takipleri')).toBeInTheDocument();
    expect(screen.getByText('Teminat Mektupları')).toBeInTheDocument();
    expect(screen.getByText('Müvekkiller')).toBeInTheDocument();
    expect(screen.getByText('Raporlar')).toBeInTheDocument();
    expect(screen.getByText('Ayarlar')).toBeInTheDocument();
  });

  test('should have correct navigation links', () => {
    renderWithRouter(<Sidebar open={true} setOpen={mockSetOpen} />);

    const homeLink = screen.getByText('Anasayfa').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');

    const casesLink = screen.getByText('Dava Dosyaları').closest('a');
    expect(casesLink).toHaveAttribute('href', '/cases');

    const executionsLink = screen.getByText('İcra Takipleri').closest('a');
    expect(executionsLink).toHaveAttribute('href', '/executions');

    const reportsLink = screen.getByText('Raporlar').closest('a');
    expect(reportsLink).toHaveAttribute('href', '/reports');

    const settingsLink = screen.getByText('Ayarlar').closest('a');
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  test('should call setOpen(false) when clicking a navigation link', () => {
    renderWithRouter(<Sidebar open={true} setOpen={mockSetOpen} />);

    const homeLink = screen.getByText('Anasayfa');
    fireEvent.click(homeLink);

    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });
});
