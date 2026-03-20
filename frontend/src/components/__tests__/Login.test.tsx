import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';

const mockLogin = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    loading: false,
    isAuthenticated: false,
  }),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render login form', () => {
    renderWithRouter(<Login />);

    expect(screen.getByText('LexCloud')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Şifrenizi girin')).toBeInTheDocument();
    expect(screen.getByText('Giriş Yap')).toBeInTheDocument();
  });

  test('should render password input field', () => {
    renderWithRouter(<Login />);

    const passwordInput = screen.getByPlaceholderText('Şifrenizi girin');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should toggle password visibility', () => {
    renderWithRouter(<Login />);

    const passwordInput = screen.getByPlaceholderText('Şifrenizi girin');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = passwordInput.parentElement?.querySelector('button');
    expect(toggleButton).toBeInTheDocument();

    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  test('should update password input value', () => {
    renderWithRouter(<Login />);

    const passwordInput = screen.getByPlaceholderText('Şifrenizi girin');
    fireEvent.change(passwordInput, { target: { value: 'test123' } });
    expect(passwordInput).toHaveValue('test123');
  });

  test('should call login on form submit', async () => {
    mockLogin.mockResolvedValue(true);
    renderWithRouter(<Login />);

    const passwordInput = screen.getByPlaceholderText('Şifrenizi girin');
    fireEvent.change(passwordInput, { target: { value: 'correct_password' } });

    const submitButton = screen.getByText('Giriş Yap');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockLogin).toHaveBeenCalledWith('correct_password');
  });

  test('should display LexCloud branding', () => {
    renderWithRouter(<Login />);

    expect(screen.getByText('LexCloud')).toBeInTheDocument();
    expect(screen.getByText('Dava takip sistemine giriş yapın')).toBeInTheDocument();
  });
});
