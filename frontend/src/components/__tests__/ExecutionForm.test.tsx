import React from 'react';
import { render, act } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { waitFor } from '@testing-library/dom';
import { BrowserRouter } from 'react-router-dom';
import ExecutionForm from '../ExecutionForm';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    clients: {
      getAll: jest.fn()
    }
  }
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-form-autosave', () => ({
  useFormAutosave: () => ({
    formData: {},
    setFormData: jest.fn(),
    clearDraft: jest.fn(),
    loadDraft: jest.fn(),
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ExecutionForm - Async State Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should resolve to success when clients load within 5s', async () => {
    const mockClients = [
      { id: '1', name: 'Test Client', email: 'test@example.com', phone: '', address: '', tax_id: '', created_at: new Date(), updated_at: new Date(), version: 1 }
    ];
    
    (api.clients.getAll as jest.Mock).mockResolvedValue(mockClients);

    await act(async () => {
      renderWithRouter(<ExecutionForm />);
    });
    
    await waitFor(async () => {
      const clientComboboxes = screen.getAllByRole('combobox');
      const clientCombobox = clientComboboxes.find(cb => 
        cb.closest('.space-y-2')?.querySelector('label')?.textContent?.includes('Müvekkil')
      );
      expect(clientCombobox).not.toHaveTextContent('Müvekkiller yükleniyor');
      expect(clientCombobox).not.toHaveTextContent('Hata oluştu');
    }, { timeout: 6000 });
  });

  test('should handle timeout but still resolve to success when data arrives late', async () => {
    const mockClients = [
      { id: '1', name: 'Late Client', email: 'late@example.com', phone: '', address: '', tax_id: '', created_at: new Date(), updated_at: new Date(), version: 1 }
    ];
    
    (api.clients.getAll as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockClients), 100))
    );

    await act(async () => {
      renderWithRouter(<ExecutionForm />);
    });
    
    await waitFor(async () => {
      const clientComboboxes = screen.getAllByRole('combobox');
      const clientCombobox = clientComboboxes.find(cb => 
        cb.closest('.space-y-2')?.querySelector('label')?.textContent?.includes('Müvekkil')
      );
      expect(clientCombobox).not.toHaveTextContent('Müvekkiller yüklenirken bir hata oluştu');
      expect(clientCombobox).not.toHaveTextContent('Müvekkiller yükleniyor');
    }, { timeout: 3000 });
  }, 10000);

  test('should show error only on real API failure', async () => {
    (api.clients.getAll as jest.Mock).mockRejectedValue(new Error('Network error'));

    await act(async () => {
      renderWithRouter(<ExecutionForm />);
    });
    
    await waitFor(async () => {
      const clientComboboxes = screen.getAllByRole('combobox');
      const clientCombobox = clientComboboxes.find(cb => 
        cb.closest('.space-y-2')?.querySelector('label')?.textContent?.includes('Müvekkil')
      );
      expect(clientCombobox).toHaveTextContent('Hata oluştu');
    }, { timeout: 10000 });
  });

  test('should handle stale requests correctly', async () => {
    const firstClients = [
      { id: '1', name: 'First Client', email: 'first@example.com', phone: '', address: '', tax_id: '', created_at: new Date(), updated_at: new Date(), version: 1 }
    ];
    const secondClients = [
      { id: '2', name: 'Second Client', email: 'second@example.com', phone: '', address: '', tax_id: '', created_at: new Date(), updated_at: new Date(), version: 1 }
    ];
    
    (api.clients.getAll as jest.Mock)
      .mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve(firstClients), 200)))
      .mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve(secondClients), 50)));

    let rerender: any;
    await act(async () => {
      const result = renderWithRouter(<ExecutionForm />);
      rerender = result.rerender;
    });
    
    await act(async () => {
      rerender(<BrowserRouter><ExecutionForm key="second" /></BrowserRouter>);
    });
    
    await waitFor(async () => {
      const clientComboboxes = screen.getAllByRole('combobox');
      const clientCombobox = clientComboboxes.find(cb => 
        cb.closest('.space-y-2')?.querySelector('label')?.textContent?.includes('Müvekkil')
      );
      expect(clientCombobox).not.toHaveTextContent('First Client');
      expect(clientCombobox).not.toHaveTextContent('Müvekkiller yükleniyor');
    }, { timeout: 2000 });
  });
});
