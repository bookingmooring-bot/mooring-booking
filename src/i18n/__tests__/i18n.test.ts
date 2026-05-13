import { describe, it, expect } from 'vitest';
import { languages } from '../index';
import en from '../locales/en.json';

describe('i18n configuration', () => {
  it('supports 15 languages', () => {
    expect(languages).toHaveLength(15);
  });

  it('has English as first language', () => {
    expect(languages[0].code).toBe('en');
  });

  it('each language has code, name, and flag', () => {
    languages.forEach(lang => {
      expect(lang.code).toBeTruthy();
      expect(lang.name).toBeTruthy();
      expect(lang.flag).toBeTruthy();
    });
  });

  it('includes Croatian, German, Italian, French, Spanish', () => {
    const codes = languages.map(l => l.code);
    expect(codes).toContain('hr');
    expect(codes).toContain('de');
    expect(codes).toContain('it');
    expect(codes).toContain('fr');
    expect(codes).toContain('es');
  });

  it('English translation file has keys', () => {
    const keys = Object.keys(en);
    expect(keys.length).toBeGreaterThan(10);
  });
});

describe('translation key coverage', () => {
  const enKeys = Object.keys(en);

  it('EN file has no empty values', () => {
    const emptyKeys = enKeys.filter(k => (en as Record<string, string>)[k] === '');
    expect(emptyKeys).toEqual([]);
  });
});
