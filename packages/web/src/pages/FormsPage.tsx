import { useEffect, useMemo, useState } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api, type FormItem } from '@/api/client';

export default function FormsPage() {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listForms().then(setForms).finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, FormItem[]>();
    for (const f of forms) {
      const k = f.category || 'general';
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(f);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [forms]);

  return (
    <div className="space-y-6">
      <PageHeader title="Документы" description="Шаблоны заявлений и форм" />

      {loading ? (
        <Card><CardContent className="p-6 text-muted-foreground text-sm">Загрузка…</CardContent></Card>
      ) : forms.length === 0 ? (
        <Card><CardContent className="p-6 text-muted-foreground text-sm">Нет шаблонов</CardContent></Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(([category, list]) => (
            <section key={category}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                {category}
                <Badge variant="secondary">{list.length}</Badge>
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {list.map((f) => (
                  <Card key={f.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {f.title}
                      </CardTitle>
                      {f.description && <CardDescription>{f.description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="pt-0">
                      {f.externalUrl && (
                        <a
                          href={f.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Открыть шаблон <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {f.fileUrl && (
                        <a
                          href={f.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Скачать файл <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
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
