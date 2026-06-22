import { useEffect, useMemo, useState } from 'react';
import { Search, Mail, Phone, MessageCircle, Cake } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api, type Employee } from '@/api/client';

export default function EmployeeContactsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listEmployees().then(setEmployees).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        (e.department ?? '').toLowerCase().includes(q) ||
        (e.position ?? '').toLowerCase().includes(q),
    );
  }, [employees, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, Employee[]>();
    for (const e of filtered) {
      const key = e.department ?? 'Без отдела';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="space-y-6">
      <PageHeader title="Сотрудники" description="Контакты коллег и оргструктура" />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по имени, должности или отделу"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Card><CardContent className="p-6 text-muted-foreground text-sm">Загрузка…</CardContent></Card>
      ) : grouped.length === 0 ? (
        <Card><CardContent className="p-6 text-muted-foreground text-sm">Никого не найдено</CardContent></Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(([department, list]) => (
            <section key={department}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {department} <Badge variant="secondary" className="ml-1">{list.length}</Badge>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((e) => (
                  <Card key={e.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold shrink-0">
                          {e.fullName
                            .split(' ')
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{e.fullName}</div>
                          <div className="text-xs text-muted-foreground truncate">{e.position}</div>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        {e.email && (
                          <a href={`mailto:${e.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{e.email}</span>
                          </a>
                        )}
                        {e.phone && (
                          <a href={`tel:${e.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <span>{e.phone}</span>
                          </a>
                        )}
                        {e.telegram && (
                          <a
                            href={`https://t.me/${e.telegram.replace('@', '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                          >
                            <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>@{e.telegram.replace('@', '')}</span>
                          </a>
                        )}
                        {e.birthday && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Cake className="h-3.5 w-3.5 shrink-0" />
                            <span>{new Date(e.birthday).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
