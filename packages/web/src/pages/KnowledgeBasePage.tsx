import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api, type KnowledgePageSummary } from '@/api/client';

export default function KnowledgeBasePage() {
  const [pages, setPages] = useState<KnowledgePageSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listPages().then(setPages).finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, KnowledgePageSummary[]>();
    for (const p of pages) {
      const k = p.category || 'general';
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(p);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [pages]);

  return (
    <div className="space-y-6">
      <PageHeader title="База знаний" description="Регламенты, гайды и онбординг" />

      {loading ? (
        <Card><CardContent className="p-6 text-muted-foreground text-sm">Загрузка…</CardContent></Card>
      ) : pages.length === 0 ? (
        <Card><CardContent className="p-6 text-muted-foreground text-sm">Нет страниц</CardContent></Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(([category, list]) => (
            <section key={category}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                {category}
                <Badge variant="secondary">{list.length}</Badge>
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {list.map((p) => (
                  <Link key={p.id} to={`/knowledge/${p.slug}`} className="group block">
                    <Card className="h-full hover:shadow-md hover:border-primary/40 transition-all">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          {p.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {p.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{p.summary}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Обновлено: {new Date(p.updatedAt).toLocaleDateString('ru-RU')}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
