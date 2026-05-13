import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { supabase } from '@/lib/supabase';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides user as null initially', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
  });

  it('throws when used outside provider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('calls supabase.auth.signUp on signUp', async () => {
    (supabase.auth.signUp as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const res = await result.current.signUp('test@test.com', 'password123', 'Test User');
      expect(res.error).toBeNull();
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
      options: { data: { full_name: 'Test User' } },
    });
  });

  it('calls supabase.auth.signInWithPassword on signIn', async () => {
    (supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const res = await result.current.signIn('test@test.com', 'pass');
      expect(res.error).toBeNull();
    });

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'pass',
    });
  });

  it('calls supabase.auth.signInWithOAuth for Google', async () => {
    (supabase.auth.signInWithOAuth as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signInWithGoogle('http://localhost/callback');
    });

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'http://localhost/callback' },
    });
  });

  it('calls supabase.auth.signInWithOAuth for Apple', async () => {
    (supabase.auth.signInWithOAuth as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signInWithApple();
    });

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'apple',
      options: { redirectTo: window.location.origin },
    });
  });

  it('calls supabase.auth.signOut on signOut', async () => {
    (supabase.auth.signOut as ReturnType<typeof vi.fn>).mockResolvedValue({});
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signOut();
    });

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('returns error from signIn when credentials invalid', async () => {
    const authError = { message: 'Invalid login credentials', status: 400 };
    (supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValue({ error: authError });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const res = await result.current.signIn('bad@test.com', 'wrong');
      expect(res.error).toEqual(authError);
    });
  });
});
