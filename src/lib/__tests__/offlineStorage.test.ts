import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.stubGlobal('indexedDB', undefined);

describe('offlineStorage', () => {
  it('module exports saveMooringsOffline function', async () => {
    const mod = await import('../offlineStorage');
    expect(typeof mod.saveMooringsOffline).toBe('function');
  });

  it('module exports getMooringsOffline function', async () => {
    const mod = await import('../offlineStorage');
    expect(typeof mod.getMooringsOffline).toBe('function');
  });

  it('module exports getOfflineTimestamp function', async () => {
    const mod = await import('../offlineStorage');
    expect(typeof mod.getOfflineTimestamp).toBe('function');
  });

  it('module exports clearOfflineData function', async () => {
    const mod = await import('../offlineStorage');
    expect(typeof mod.clearOfflineData).toBe('function');
  });
});
