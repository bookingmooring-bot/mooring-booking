import { vi } from 'vitest';

export function createMockSupabaseClient() {
  const mockAuth = {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    exchangeCodeForSession: vi.fn(),
  };

  const chainable = () => {
    const obj: Record<string, any> = {};
    const methods = ['select', 'insert', 'update', 'delete', 'eq', 'neq', 'gte', 'lt', 'gt',
      'in', 'order', 'limit', 'range', 'single', 'maybeSingle', 'filter', 'match', 'is'];
    methods.forEach(m => {
      obj[m] = vi.fn().mockReturnValue(obj);
    });
    obj.single.mockResolvedValue({ data: null, error: null });
    return obj;
  };

  return {
    auth: mockAuth,
    from: vi.fn().mockImplementation(() => chainable()),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.supabase.co/storage/test.jpg' } }),
      }),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  };
}
