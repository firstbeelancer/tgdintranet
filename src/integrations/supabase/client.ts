// Fake Supabase client — translates supabase-js calls to our internal REST API.
// This file replaces the original `client.ts` that used real Supabase.
// The UI code (`supabase.from(...).select(...)` etc.) is unchanged.

const API_BASE: string =
  (typeof window !== 'undefined' && (window as any).__API_URL__) ||
  (import.meta as any).env?.VITE_API_PREFIX ||
  '/api';

// In-memory session store that mimics Supabase's auth state
export type AuthUser = { id: string; email: string };

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: 'bearer';
  user: { id: string; email: string };
};

const SESSION_KEY = 'tgdintranet_session';

function loadSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as AuthSession;
    if (s.expires_at && Date.now() / 1000 > s.expires_at) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function saveSession(s: AuthSession | null) {
  if (typeof window === 'undefined') return;
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else localStorage.removeItem(SESSION_KEY);
}

let currentSession: AuthSession | null = loadSession();
const authListeners: Array<(event: string, session: AuthSession | null) => void> = [];

function notifyAuth(event: string, session: AuthSession | null) {
  currentSession = session;
  saveSession(session);
  authListeners.forEach((cb) => cb(event, session));
}

async function apiFetch(path: string, init: RequestInit = {}): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (currentSession?.access_token) {
    headers.Authorization = `Bearer ${currentSession.access_token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = (data && (data.message || data.error || data)) || `HTTP ${res.status}`;
    const err: any = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    err.status = res.status;
    throw err;
  }
  return data;
}

// Build a query builder for `.from('table')...`
type Filter = { type: string; col: string; val: any };
class QueryBuilder {
  private filters: Filter[] = [];
  private selectCols = '*';
  private orderBy: { col: string; ascending: boolean } | null = null;
  private limitN: number | null = null;
  private isSingle = false;
  private method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET';
  private body: any = null;

  constructor(private table: string) {}

  select(cols: string) { this.selectCols = cols; return this; }
  eq(col: string, val: any) { this.filters.push({ type: 'eq', col, val }); return this; }
  neq(col: string, val: any) { this.filters.push({ type: 'neq', col, val }); return this; }
  in(col: string, vals: any[]) { this.filters.push({ type: 'in', col, val: vals }); return this; }
  gte(col: string, val: any) { this.filters.push({ type: 'gte', col, val }); return this; }
  lte(col: string, val: any) { this.filters.push({ type: 'lte', col, val }); return this; }
  gt(col: string, val: any) { this.filters.push({ type: 'gt', col, val }); return this; }
  lt(col: string, val: any) { this.filters.push({ type: 'lt', col, val }); return this; }
  like(col: string, val: any) { this.filters.push({ type: 'like', col, val }); return this; }
  ilike(col: string, val: any) { this.filters.push({ type: 'ilike', col, val }); return this; }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderBy = { col, ascending: opts?.ascending !== false };
    return this;
  }
  limit(n: number) { this.limitN = n; return this; }
  range(_from: number, _to: number) { return this; }
  single() { this.isSingle = true; return this.exec(); }
  maybeSingle() { this.isSingle = true; return this.exec(); }

  insert(payload: any) { this.method = 'POST'; this.body = Array.isArray(payload) ? payload : [payload]; return this.exec(); }
  update(payload: any) { this.method = 'PATCH'; this.body = payload; return this; }
  upsert(payload: any, _opts?: any) { this.method = 'POST'; this.body = Array.isArray(payload) ? payload : [payload]; return this.exec(); }
  delete() { this.method = 'DELETE'; return this; }

  // Make the builder thenable: `await supabase.from(...).select(...)`
  then(resolve: (v: any) => any, reject: (e: any) => any) {
    return this.exec().then(resolve, reject);
  }

  [Symbol.asyncIterator]() { throw new Error('not supported'); }

  private async exec(): Promise<{ data: any; error: any }> {
    try {
      const params = new URLSearchParams();
      for (const f of this.filters) {
        params.append(f.col, `${f.type}.${f.val}`);
      }
      if (this.orderBy) {
        params.append('order', `${this.orderBy.col}.${this.orderBy.ascending ? 'asc' : 'desc'}`);
      }
      if (this.limitN != null) {
        params.append('limit', String(this.limitN));
      }
      let path = `/v1/${this.table}`;
      const qs = params.toString();
      if (this.method === 'GET' && qs) path += `?${qs}`;

      let res: any;
      if (this.method === 'GET') {
        res = await apiFetch(path);
      } else if (this.method === 'POST') {
        res = await apiFetch(path, { method: 'POST', body: JSON.stringify(this.body) });
      } else if (this.method === 'PATCH') {
        const idFilter = this.filters.find((f) => f.col === 'id' && f.type === 'eq');
        if (!idFilter) {
          return { data: null, error: { message: 'PATCH requires .eq("id", ...)' } };
        }
        const patchPath = `/v1/${this.table}/${idFilter.val}`;
        res = await apiFetch(patchPath, { method: 'PATCH', body: JSON.stringify(this.body) });
      } else if (this.method === 'DELETE') {
        const idFilter = this.filters.find((f) => f.col === 'id' && f.type === 'eq');
        if (idFilter) {
          res = await apiFetch(`/v1/${this.table}/${idFilter.val}`, { method: 'DELETE' });
        } else {
          res = await apiFetch(path, { method: 'DELETE' });
        }
      } else {
        return { data: null, error: { message: `Unsupported method ${this.method}` } };
      }

      let data: any = res;
      if (this.isSingle) {
        data = Array.isArray(res) ? (res[0] ?? null) : (res ?? null);
      }
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || String(err), status: err.status } };
    }
  }
}

// Storage mock
class StorageBucket {
  constructor(private name: string) {}
  getPublicUrl(path: string) {
    return { data: { publicUrl: `/api/storage/v1/object/${this.name}/${path}` } };
  }
  async upload(path: string, _file: File | Blob) {
    return { data: { path }, error: null };
  }
  async remove(paths: string[]) {
    return { data: paths.map((p) => ({ name: p })), error: null };
  }
  async list() { return { data: [], error: null }; }
  async download() { return { data: null, error: { message: 'Not implemented' } }; }
}

class StorageApi {
  from(name: string) { return new StorageBucket(name); }
}

// Auth mock
class AuthApi {
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      const data = await apiFetch('/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const session: AuthSession = {
        access_token: data.token,
        refresh_token: data.token,
        expires_in: 43200,
        expires_at: Math.floor(Date.now() / 1000) + 43200,
        token_type: 'bearer',
        user: { id: data.user.id, email: data.user.email },
      };
      notifyAuth('SIGNED_IN', session);
      return { data: { user: session.user, session }, error: null };
    } catch (err: any) {
      return { data: { user: null, session: null }, error: { message: err.message } };
    }
  }

  async signOut(_opts?: any) {
    notifyAuth('SIGNED_OUT', null);
    return { error: null };
  }

  async getSession() {
    return { data: { session: currentSession }, error: null };
  }

  async getUser() {
    if (!currentSession) return { data: { user: null }, error: null };
    try {
      const u = await apiFetch('/v1/auth/me');
      return { data: { user: { id: u.id, email: u.email } }, error: null };
    } catch (err: any) {
      return { data: { user: null }, error: { message: err.message } };
    }
  }

  onAuthStateChange(cb: (event: string, session: AuthSession | null) => void) {
    authListeners.push(cb);
    setTimeout(() => cb('INITIAL_SESSION', currentSession), 0);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const idx = authListeners.indexOf(cb);
            if (idx >= 0) authListeners.splice(idx, 1);
          },
        },
      },
    };
  }
}

// Realtime mock
class Channel {
  constructor(public name: string) {}
  on(_type: string, _opts: any, _cb: any) { return this; }
  subscribe(cb?: (status: string) => void) {
    setTimeout(() => cb?.('SUBSCRIBED'), 0);
    return this;
  }
  unsubscribe() { return Promise.resolve('ok'); }
}

class RealtimeApi {
  channel(name: string) { return new Channel(name); }
  removeChannel(_c: any) { return Promise.resolve('ok'); }
}

// Functions mock
class FunctionsApi {
  async invoke(name: string, opts?: { body?: any }) {
    try {
      const res = await apiFetch(`/functions/v1/${name}`, {
        method: 'POST',
        body: JSON.stringify(opts?.body || {}),
      });
      return { data: res, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }
}

export const supabase = {
  from: (table: string) => new QueryBuilder(table),
  auth: new AuthApi(),
  storage: new StorageApi(),
  functions: new FunctionsApi(),
  channel: (name: string) => new Channel(name),
  removeChannel: (_c: any) => Promise.resolve('ok'),
  rpc: (_name: string, _args?: any) => Promise.resolve({ data: null, error: null }),
};
