import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { authService } from '../../services/auth/authService';
import { supabase } from '../../config/supabase';

// Mock Supabase
vi.mock('../../config/supabase', () => ({
  supabase: {
    auth: {
      signInAnonymously: vi.fn(),
      signInWithPassword: vi.fn(), 
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      insert: vi.fn(),
      update: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }
}));

// Mock de los servicios que usa authService
vi.mock('../../services/profile/userServiceRepo', () => ({
  userServiceRepo: {
    createUserProfile: vi.fn(),
    getUserProfile: vi.fn()
  }
}));

vi.mock('../../services/categories/categoryServiceRepo', () => ({
  categoryServiceRepo: {
    initializeDefaultCategories: vi.fn()
  }
}));

// Componente de prueba que simula el flujo de autenticación
const TestAuthComponent = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <div data-testid="auth-content">
        {children}
      </div>
    </AuthProvider>
  );
};

describe('Integration: Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería permitir login como invitado', async () => {
    const mockUser = {
      id: 'guest-user-123',
      email: null,
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    };

    (supabase.auth.signUp as any).mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null
    });

    const result = await authService.signInAsGuest();

    expect(result.success).toBe(true);
    expect(supabase.auth.signUp).toHaveBeenCalled();
  });

  it('debería permitir registro con email y contraseña', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const mockUser = {
      id: 'user-123',
      email,
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated', 
      created_at: new Date().toISOString()
    };

    (supabase.auth.signUp as any).mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null
    });

    const result = await authService.signUpWithEmail(email, password);

    expect(result.success).toBe(true);
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email,
      password
    });
  });

  it('debería permitir login con email y contraseña', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const mockUser = {
      id: 'user-123',
      email,
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    };

    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null
    });

    const result = await authService.signInWithEmail(email, password);

    expect(result.success).toBe(true);
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email,
      password
    });
  });

  it('debería permitir login con Google', async () => {
    const mockUser = {
      id: 'google-user-123',
      email: 'test@gmail.com',
      user_metadata: { name: 'Test User' },
      app_metadata: { provider: 'google' },
      aud: 'authenticated',
      created_at: new Date().toISOString()
    };

    (supabase.auth.signInWithOAuth as any).mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null
    });

    const result = await authService.signInWithGoogle();

    expect(result.success).toBe(true);
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google'
    });
  });

  it('debería cerrar sesión correctamente', async () => {
    (supabase.auth.signOut as any).mockResolvedValue({
      error: null
    });

    const result = await authService.signOut();

    expect(result.success).toBe(true);
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('debería manejar errores de autenticación', async () => {
    const email = 'invalid@example.com';
    const password = 'wrongpassword';

    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials', code: 'invalid_credentials' }
    });

    const result = await authService.signInWithEmail(email, password);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('debería renderizar el AuthProvider correctamente', () => {
    render(
      <TestAuthComponent>
        <div data-testid="test-content">Test Content</div>
      </TestAuthComponent>
    );

    expect(screen.getByTestId('auth-content')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('debería manejar el estado de carga durante la autenticación', async () => {
    // Mock del estado de carga
    const mockGetUser = vi.fn().mockResolvedValue({ 
      data: { user: null }, 
      error: null 
    });
    (supabase.auth.getUser as any).mockImplementation(mockGetUser);

    render(
      <TestAuthComponent>
        <div data-testid="test-content">Test Content</div>
      </TestAuthComponent>
    );

    // El componente debería renderizarse inmediatamente
    expect(screen.getByTestId('auth-content')).toBeInTheDocument();
  });

  it('debería limpiar la suscripción al desmontar', () => {
    const mockUnsubscribe = vi.fn();
    (supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } }
    });

    const { unmount } = render(
      <TestAuthComponent>
        <div data-testid="test-content">Test Content</div>
      </TestAuthComponent>
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});