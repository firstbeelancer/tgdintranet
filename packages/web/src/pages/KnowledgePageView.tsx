import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api, type KnowledgePage } from '@/api/client';

export default function KnowledgePageView() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<KnowledgePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api
      .getPage(slug)
      .then(setPage)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Card><CardContent className="p-6 text-muted-foreground">Загрузка…</CardContent></Card>;
  if (error || !page) return <Card><CardContent className="p-6 text-muted-foreground">{error || 'Не найдено'}</CardContent></Card>;

  return (
    <div className="space-y-4">
      <PageHeader title={page.title} description={page.summary ?? undefined} backTo="/knowledge">
        <Badge variant="outline">{page.category}</Badge>
      </PageHeader>
      <Card>
        <CardContent className="p-6 lg:p-8 prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{page.body}</pre>
        </CardContent>
      </Card>
      <div className="text-xs text-muted-foreground">
        Обновлено: {new Date(page.updatedAt).toLocaleString('ru-RU')}
      </div>
    </div>
  );
}
