import { useEffect, useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { api, type UserRole, type ApiError } from '@/api/client';

type UserRow = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  position: string | null;
  department: string | null;
  isActive: boolean;
  createdAt: string;
};

export default function AdminPanel() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refresh = () => {
    setLoading(true);
    api.listUsers().then(setUsers).finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      await api.createUser({
        email: email.trim().toLowerCase(),
        password,
        displayName: displayName.trim(),
        role,
        position: position.trim() || undefined,
        department: department.trim() || undefined,
      });
      setMessage({ type: 'success', text: `Создан: ${email}` });
      setEmail('');
      setPassword('');
      setDisplayName('');
      setRole('user');
      setPosition('');
      setDepartment('');
      refresh();
    } catch (err) {
      const apiErr = err as ApiError;
      setMessage({ type: 'error', text: apiErr.message || 'Не удалось создать пользователя' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Админ-панель"
        description="Управление пользователями и ролями (только admin)"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Новый пользователь</CardTitle>
            <CardDescription>Создание учётной записи</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Пароль (мин. 8)</Label>
                <Input id="password" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="displayName">Имя</Label>
                <Input id="displayName" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role">Роль</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="user">user — базовый доступ</option>
                  <option value="marketer">marketer — + маркетинг</option>
                  <option value="admin">admin — полный доступ</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="position">Должность</Label>
                <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="department">Отдел</Label>
                <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} />
              </div>
              {message && (
                <div
                  className={
                    'rounded-md p-3 text-sm ' +
                    (message.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                      : 'bg-destructive/10 text-destructive border border-destructive/30')
                  }
                >
                  {message.text}
                </div>
              )}
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Создаём...' : 'Создать'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Пользователи</CardTitle>
            <CardDescription>Всего: {users.length}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Загрузка…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b">
                    <tr>
                      <th className="py-2 pr-3">Имя</th>
                      <th className="py-2 pr-3">Email</th>
                      <th className="py-2 pr-3">Роль</th>
                      <th className="py-2 pr-3">Отдел</th>
                      <th className="py-2 pr-3">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b last:border-0">
                        <td className="py-2 pr-3 font-medium">{u.displayName}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{u.email}</td>
                        <td className="py-2 pr-3">
                          <Badge
                            variant={
                              u.role === 'admin' ? 'destructive' : u.role === 'marketer' ? 'accent' : 'secondary'
                            }
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">{u.department ?? '—'}</td>
                        <td className="py-2 pr-3">
                          <Badge variant={u.isActive ? 'success' : 'secondary'}>
                            {u.isActive ? 'активен' : 'отключён'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
