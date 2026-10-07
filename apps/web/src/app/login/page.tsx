'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginRequest } from '@/lib/api';
import { saveSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@postrestoran.com');
  const [password, setPassword] = useState('admin123');
  const [tenantId, setTenantId] = useState('mock-tenant');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await loginRequest({ email, password, tenantId });
      const accessToken = result.accessToken || result.token;
      if (!accessToken) {
        throw new Error('Login response missing token');
      }
      saveSession({
        accessToken,
        user: result.user,
        tenant: result.tenant,
      });
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Ordiyo POS
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Giriş</h1>
        <p className="text-sm text-muted-foreground">
          Demo admin ile backend dikey dilimini test edin.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block space-y-1.5 text-sm">
          <span>Tenant</span>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            autoComplete="organization"
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span>E-posta</span>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span>Şifre</span>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {error ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {loading ? 'Giriş yapılıyor...' : 'Giriş yap'}
        </button>
      </form>
    </main>
  );
}
