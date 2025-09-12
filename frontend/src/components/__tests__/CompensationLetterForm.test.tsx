import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CompensationLetterForm from '../CompensationLetterForm';
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

describe('CompensationLetterForm - Async State Management', () => {
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
      renderWithRouter(<CompensationLetterForm />);
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

  test('should handle network errors gracefully', async () => {
    (api.clients.getAll as jest.Mock).mockRejectedValue(new Error('Network error'));

    await act(async () => {
      renderWithRouter(<CompensationLetterForm />);
    });
    
    
    await waitFor(async () => {
      const clientComboboxes = screen.getAllByRole('combobox');
      const clientCombobox = clientComboboxes.find(cb => 
        cb.closest('.space-y-2')?.querySelector('label')?.textContent?.includes('Müvekkil')
      );
      expect(clientCombobox).toHaveTextContent('Hata oluştu');
    }, { timeout: 10000 });
  });
});
