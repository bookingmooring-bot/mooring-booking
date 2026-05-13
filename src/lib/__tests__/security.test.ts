import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Security: No hardcoded secrets in client bundle', () => {
  const srcDir = path.resolve(__dirname, '../../');
  const clientFiles: string[] = [];

  function collectFiles(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '__tests__' || entry.name === 'test') continue;
        collectFiles(full);
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        clientFiles.push(full);
      }
    }
  }

  collectFiles(srcDir);

  it('no sk_live Stripe secret keys in src/', () => {
    for (const file of clientFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/sk_live_[A-Za-z0-9]+/);
    }
  });

  it('no sk_test Stripe secret keys in src/', () => {
    for (const file of clientFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/sk_test_[A-Za-z0-9]{20,}/);
    }
  });

  it('no Resend API keys (re_) in src/', () => {
    for (const file of clientFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/re_[A-Za-z0-9]{20,}/);
    }
  });

  it('no service_role keys in src/', () => {
    for (const file of clientFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/service_role/);
    }
  });

  it('no hardcoded Supabase URLs without env vars in src/ (excluding supabase.ts)', () => {
    for (const file of clientFiles) {
      if (file.endsWith('supabase.ts')) continue;
      const content = fs.readFileSync(file, 'utf-8');
      const matches = content.match(/https:\/\/[a-z]+\.supabase\.co/g) || [];
      const nonEnv = matches.filter(m => !content.includes('import.meta.env'));
      if (nonEnv.length > 0 && !content.includes('import.meta.env.VITE_SUPABASE_URL')) {
        expect.soft(nonEnv, `Hardcoded Supabase URL in ${file}`).toEqual([]);
      }
    }
  });

  it('no passwords or tokens in plain text', () => {
    for (const file of clientFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/password\s*[:=]\s*['"][^'"]{8,}['"]/i);
    }
  });
});

describe('Security: RLS base schema checks', () => {
  const migrationPath = path.resolve(__dirname, '../../../supabase/migrations/00000000000000_base_schema.sql');

  it('base migration file exists', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
  });

  it('RLS enabled on profiles table', () => {
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    expect(sql).toMatch(/alter table.*profiles.*enable row level security/i);
  });

  it('RLS enabled on bookings table', () => {
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    expect(sql).toMatch(/alter table.*bookings.*enable row level security/i);
  });

  it('RLS enabled on moorings table', () => {
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    expect(sql).toMatch(/alter table.*moorings.*enable row level security/i);
  });
});
