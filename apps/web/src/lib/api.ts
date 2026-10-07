const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export type AuthSession = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    tenantId: string;
  };
  tenant: {
    id: string;
    name: string;
    slug: string | null;
  };
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export function loginRequest(body: {
  email: string;
  password: string;
  tenantId: string;
}) {
  return apiFetch<AuthSession & { token?: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
