import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({ data: null, isLoading: false }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { changeLanguage: vi.fn(), language: 'en' } }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

function renderPage(element: React.ReactElement) {
  return render(<MemoryRouter>{element}</MemoryRouter>);
}

describe('Static Pages', () => {
  it('Privacy page renders', async () => {
    const { default: Privacy } = await import('../../pages/Privacy');
    renderPage(<Privacy />);
    expect(document.body.textContent).toBeTruthy();
  });

  it('Terms page renders', async () => {
    const { default: Terms } = await import('../../pages/Terms');
    renderPage(<Terms />);
    expect(document.body.textContent).toBeTruthy();
  });

  it('NotFound page renders', async () => {
    const { default: NotFound } = await import('../../pages/NotFound');
    renderPage(<NotFound />);
    expect(document.body.textContent).toBeTruthy();
  });
});
