// API client для общения с tgdintranet-api
// Базовый URL читается из VITE_API_URL (define в vite.config.ts)

declare const __API_URL__: string;

const API_URL: string = (typeof __API_URL__ !== 'undefined' ? __API_URL__ : '/api') as string;

export type UserRole = 'admin' | 'marketer' | 'user';

export type User = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  position?: string | null;
  department?: string | null;
  phone?: string | null;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: UserRole;
  isPinned: boolean;
  publishedAt: string;
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  url: string;
  category: string;
  iconName: string | null;
  displayOrder: number;
  visibleTo: UserRole;
};

export type Employee = {
  id: string;
  fullName: string;
  position: string;
  department: string | null;
  email: string | null;
  phone: string | null;
  telegram: string | null;
  birthday: string | null;
  avatarUrl: string | null;
};

export type FormItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileUrl: string | null;
  externalUrl: string | null;
  visibleTo: UserRole;
};

export type KnowledgePageSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string;
  visibleTo: UserRole;
  updatedAt: string;
};

export type KnowledgePage = KnowledgePageSummary & {
  body: string;
};

class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

const TOKEN_KEY = 'tgdintranet_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });

  if (res.status === 204) return undefined as T;

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // empty body
  }

  if (!res.ok) {
    throw new ApiError(res.status, data?.error ?? 'unknown', data?.message ?? `HTTP ${res.status}`);
  }
  return data as T;
}

export const api = {
  health: () => request<{ status: string }>(`/v1/health`),

  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>(`/v1/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<User>(`/v1/auth/me`),
  logout: () => setToken(null),

  // Announcements
  listAnnouncements: () => request<Announcement[]>(`/v1/announcements`),
  createAnnouncement: (input: { title: string; body: string; audience: UserRole; isPinned?: boolean }) =>
    request<Announcement>(`/v1/announcements`, { method: 'POST', body: JSON.stringify(input) }),
  deleteAnnouncement: (id: string) =>
    request<void>(`/v1/announcements/${id}`, { method: 'DELETE' }),

  // Services
  listServices: () => request<Service[]>(`/v1/services`),
  createService: (input: Omit<Service, 'id'>) =>
    request<Service>(`/v1/services`, { method: 'POST', body: JSON.stringify(input) }),
  deleteService: (id: string) =>
    request<void>(`/v1/services/${id}`, { method: 'DELETE' }),

  // Employees
  listEmployees: () => request<Employee[]>(`/v1/employees`),
  getEmployeeChildren: (id: string) =>
    request<Array<{ id: string; name: string | null; birthday: string; gender: string }>>(
      `/v1/employees/${id}/children`,
    ),

  // Forms
  listForms: () => request<FormItem[]>(`/v1/forms`),

  // Knowledge base
  listPages: () => request<KnowledgePageSummary[]>(`/v1/pages`),
  getPage: (slug: string) => request<KnowledgePage>(`/v1/pages/${slug}`),

  // Users (admin)
  listUsers: () =>
    request<
      Array<{
        id: string;
        email: string;
        displayName: string;
        role: UserRole;
        position: string | null;
        department: string | null;
        isActive: boolean;
        createdAt: string;
      }>
    >(`/v1/users`),
  createUser: (input: {
    email: string;
    password: string;
    displayName: string;
    role: UserRole;
    position?: string;
    department?: string;
  }) => request<User>(`/v1/users`, { method: 'POST', body: JSON.stringify(input) }),
};

export { ApiError };
