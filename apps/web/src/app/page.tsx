'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { clearSession, loadSession, type AuthSession } from '@/lib/auth';

type Category = {
  id: string;
  name: string;
  products: Array<{ id: string; name: string; price: string | number }>;
};

type TableRow = {
  id: string;
  name: string;
  status: string;
  capacity: number;
  zone?: { id: string; name: string } | null;
};

export default function HomePage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<TableRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = loadSession();
    if (!current) {
      router.replace('/login');
      return;
    }
    setSession(current);

    Promise.all([
      apiFetch<Category[]>('/catalog/categories', { token: current.accessToken }),
      apiFetch<TableRow[]>('/tables', { token: current.accessToken }),
    ])
      .then(([cats, tbls]) => {
        setCategories(cats);
        setTables(tbls);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Veri yüklenemedi');
      })
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    clearSession();
    router.replace('/login');
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 text-sm text-muted-foreground">
        Oturum kontrol ediliyor...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Ordiyo POS
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {session.tenant.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {session.user.fullName} · {session.user.role}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-md border border-border px-3 py-2 text-sm"
        >
          Çıkış
        </button>
      </header>

      {loading ? <p className="text-sm text-muted-foreground">Yükleniyor...</p> : null}
      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Masalar</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {tables.map((table) => (
            <li key={table.id} className="rounded-md border border-border px-4 py-3">
              <div className="font-medium">{table.name}</div>
              <div className="text-sm text-muted-foreground">
                {table.zone?.name || 'Bölgesiz'} · {table.status} · {table.capacity} kişi
              </div>
            </li>
          ))}
          {!loading && tables.length === 0 ? (
            <li className="text-sm text-muted-foreground">Masa yok</li>
          ) : null}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Menü kategorileri</h2>
        <ul className="space-y-4">
          {categories.map((category) => (
            <li key={category.id} className="rounded-md border border-border px-4 py-3">
              <div className="mb-2 font-medium">{category.name}</div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {category.products.map((product) => (
                  <li key={product.id} className="flex justify-between gap-4">
                    <span>{product.name}</span>
                    <span>{Number(product.price).toFixed(2)} TRY</span>
                  </li>
                ))}
                {category.products.length === 0 ? <li>Ürün yok</li> : null}
              </ul>
            </li>
          ))}
          {!loading && categories.length === 0 ? (
            <li className="text-sm text-muted-foreground">Kategori yok</li>
          ) : null}
        </ul>
      </section>
    </main>
  );
}
