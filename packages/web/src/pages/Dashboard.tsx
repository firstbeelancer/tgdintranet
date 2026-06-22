import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ExternalLink, ArrowRight, Pin } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api, type Announcement, type Service } from '@/api/client';

function ServiceIcon({ name }: { name: string | null }) {
  // Lazy icon rendering: just show first letter as fallback
  return (
    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold uppercase">
      {name ? name[0] : '?'}
    </div>
  );
}

export default function Dashboard() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.listAnnouncements(), api.listServices()])
      .then(([a, s]) => {
        setAnnouncements(a);
        setServices(s);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader title="Главная" description="Объявления и быстрый доступ к сервисам" />

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Объявления
          </h2>
          <Badge variant="secondary">{announcements.length}</Badge>
        </div>
        {loading ? (
          <Card><CardContent className="p-6 text-muted-foreground text-sm">Загрузка…</CardContent></Card>
        ) : announcements.length === 0 ? (
          <Card><CardContent className="p-6 text-muted-foreground text-sm">Пока нет объявлений</CardContent></Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {announcements.map((a) => (
              <Card key={a.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{a.title}</CardTitle>
                    {a.isPinned && <Pin className="h-4 w-4 text-accent shrink-0" />}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(a.publishedAt).toLocaleString('ru-RU', { dateStyle: 'long', timeStyle: 'short' })}
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground whitespace-pre-line">{a.body}</CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Быстрые ссылки</h2>
          <Badge variant="secondary">{services.length}</Badge>
        </div>
        {loading ? (
          <Card><CardContent className="p-6 text-muted-foreground text-sm">Загрузка…</CardContent></Card>
        ) : services.length === 0 ? (
          <Card><CardContent className="p-6 text-muted-foreground text-sm">Нет доступных сервисов</CardContent></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="group block"
              >
                <Card className="h-full hover:shadow-md hover:border-primary/40 transition-all">
                  <CardContent className="p-4 flex items-start gap-3">
                    <ServiceIcon name={s.iconName} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm flex items-center gap-1">
                        {s.name}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {s.description && (
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{s.description}</div>
                      )}
                      <Badge variant="outline" className="mt-2 text-xs">
                        {s.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Разделы</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { to: '/employees', label: 'Сотрудники', desc: 'Контакты коллег и оргструктура' },
            { to: '/forms', label: 'Документы', desc: 'Шаблоны заявлений и форм' },
            { to: '/knowledge', label: 'База знаний', desc: 'Регламенты и гайды' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group block"
            >
              <Card className="h-full hover:shadow-md hover:border-primary/40 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
