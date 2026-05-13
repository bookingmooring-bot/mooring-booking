import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import AdminRoute from '../AdminRoute';

const mockUseAuth = vi.fn();
const mockUseProfile = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => mockUseProfile(),
}));

function renderWithRouter(element: React.ReactElement, initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/auth" element={<div>Auth Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/protected" element={<ProtectedRoute>{element}</ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute>{element}</AdminRoute>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUseProfile.mockReturnValue({ data: null, isLoading: false });
  });

  it('redirects unauthenticated user to /auth', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    renderWithRouter(<div>Secret</div>, '/protected');
    expect(screen.getByText('Auth Page')).toBeInTheDocument();
  });

  it('renders children for authenticated user', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, loading: false });
    renderWithRouter(<div>Secret Content</div>, '/protected');
    expect(screen.getByText('Secret Content')).toBeInTheDocument();
  });

  it('shows loading spinner while checking auth', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    renderWithRouter(<div>Secret</div>, '/protected');
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
    expect(screen.queryByText('Auth Page')).not.toBeInTheDocument();
  });
});

describe('AdminRoute', () => {
  it('redirects unauthenticated user to /auth', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    mockUseProfile.mockReturnValue({ data: null, isLoading: false });
    renderWithRouter(<div>Admin Panel</div>, '/admin');
    expect(screen.getByText('Auth Page')).toBeInTheDocument();
  });

  it('redirects non-admin to /dashboard', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, loading: false });
    mockUseProfile.mockReturnValue({ data: { role: 'user' }, isLoading: false });
    renderWithRouter(<div>Admin Panel</div>, '/admin');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders children for admin user', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'a1' }, loading: false });
    mockUseProfile.mockReturnValue({ data: { role: 'admin' }, isLoading: false });
    renderWithRouter(<div>Admin Panel</div>, '/admin');
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('redirects provider to /dashboard', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'p1' }, loading: false });
    mockUseProfile.mockReturnValue({ data: { role: 'provider' }, isLoading: false });
    renderWithRouter(<div>Admin Panel</div>, '/admin');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('shows loading while checking profile', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, loading: false });
    mockUseProfile.mockReturnValue({ data: null, isLoading: true });
    renderWithRouter(<div>Admin Panel</div>, '/admin');
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
    expect(screen.queryByText('Auth Page')).not.toBeInTheDocument();
  });
});
