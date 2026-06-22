import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, AlertCircle } from 'lucide-react';
import { ApiError } from '@/api/client';

const DEMO_CREDS = [
  { role: 'Админ', email: 'admin@intranet.local', password: 'Admin2026!Demo' },
  { role: 'Маркетолог', email: 'marketer@intranet.local', password: 'Marketer2026!Demo' },
  { role: 'Пользователь', email: 'user@intranet.local', password: 'User2026!Demo' },
];

export default function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Ошибка входа');
      } else {
        setError('Не удалось войти. Проверьте соединение.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (creds: { email: string; password: string }) => {
    setEmail(creds.email);
    setPassword(creds.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 rounded-xl bg-welcome-gradient items-center justify-center text-white">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">TGD Intranet</h1>
          <p className="text-sm text-muted-foreground">Корпоративный хаб TGD Apps</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Вход в систему</CardTitle>
            <CardDescription>Используйте корпоративный email и пароль</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@tigerapps.pro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                  <div className="text-destructive">{error}</div>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Входим...' : 'Войти'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50 border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Тестовые доступы (прототип)</CardTitle>
            <CardDescription className="text-xs">Нажмите, чтобы подставить креды</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {DEMO_CREDS.map((c) => (
              <button
                key={c.email}
                type="button"
                onClick={() => fillDemo(c)}
                className="w-full text-left rounded-md border bg-background hover:bg-accent/10 transition-colors p-2.5 text-xs"
              >
                <div className="font-semibold">{c.role}</div>
                <div className="text-muted-foreground font-mono">{c.email}</div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
