import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Image as ImageIcon, FolderOpen } from 'lucide-react';

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Маркетинг"
        description="Брендбук, креативы, отчёты и рекламные материалы"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="h-4 w-4 text-primary" />
              Креативы и баннеры
            </CardTitle>
            <CardDescription>Текущие рекламные макеты в работе</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Badge variant="outline">В работе: 3</Badge>
            <p className="mt-3">Все макеты согласуются в Figma и сохраняются в Google Drive.</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="h-4 w-4 text-primary" />
              Кампании
            </CardTitle>
            <CardDescription>Активные рекламные кампании</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Badge variant="success">Активных: 2</Badge>
            <p className="mt-3">Статистика по кампаниям в Яндекс.Метрике и Google Analytics.</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderOpen className="h-4 w-4 text-primary" />
              Брендбук
            </CardTitle>
            <CardDescription>Гайдлайны, логотипы, типографика</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Badge variant="secondary">v3.2</Badge>
            <p className="mt-3">Актуальные правила использования бренда — в разделе «База знаний → brand-guidelines».</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Полезные разделы</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <a href="https://www.figma.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">→ Figma Workspace</a>
          <a href="https://metrika.yandex.ru" target="_blank" rel="noreferrer" className="text-primary hover:underline">→ Яндекс.Метрика</a>
          <a href="/knowledge/brand-guidelines" className="text-primary hover:underline">→ Гайдлайны бренда</a>
        </CardContent>
      </Card>
    </div>
  );
}
