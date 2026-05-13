import { describe, it, expect } from 'vitest';
import { RESERVED_SLUGS, isSlugFormatValid } from '../reservedSlugs';

describe('RESERVED_SLUGS', () => {
  it('contains core route slugs', () => {
    expect(RESERVED_SLUGS.has('auth')).toBe(true);
    expect(RESERVED_SLUGS.has('admin')).toBe(true);
    expect(RESERVED_SLUGS.has('dashboard')).toBe(true);
    expect(RESERVED_SLUGS.has('explore')).toBe(true);
  });

  it('contains system slugs', () => {
    expect(RESERVED_SLUGS.has('api')).toBe(true);
    expect(RESERVED_SLUGS.has('webhook')).toBe(true);
    expect(RESERVED_SLUGS.has('stripe')).toBe(true);
  });
});

describe('isSlugFormatValid', () => {
  it('accepts valid slugs', () => {
    expect(isSlugFormatValid('my-marina')).toBe(true);
    expect(isSlugFormatValid('marina123')).toBe(true);
    expect(isSlugFormatValid('a-b-c-d')).toBe(true);
  });

  it('rejects slugs too short', () => {
    expect(isSlugFormatValid('ab')).toBe(false);
  });

  it('rejects slugs starting with hyphen', () => {
    expect(isSlugFormatValid('-marina')).toBe(false);
  });

  it('rejects slugs ending with hyphen', () => {
    expect(isSlugFormatValid('marina-')).toBe(false);
  });

  it('rejects uppercase', () => {
    expect(isSlugFormatValid('MyMarina')).toBe(false);
  });

  it('rejects special characters', () => {
    expect(isSlugFormatValid('my_marina')).toBe(false);
    expect(isSlugFormatValid('my marina')).toBe(false);
  });
});
