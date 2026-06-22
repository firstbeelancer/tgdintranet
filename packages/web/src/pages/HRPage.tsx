import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Baby, Briefcase } from 'lucide-react';

export default function HRPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="HR" description="Кадровая информация (только для администраторов)" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              Штат
            </CardTitle>
            <CardDescription>Активные сотрудники</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <Badge variant="secondary" className="mt-2">см. Сотрудники</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Baby className="h-4 w-4 text-primary" />
              Дети сотрудников
            </CardTitle>
            <CardDescription>Для поздравлений и подарков</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <Badge variant="secondary" className="mt-2">в разработке</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-4 w-4 text-primary" />
              Вакансии
            </CardTitle>
            <CardDescription>Открытые позиции</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <Badge variant="secondary" className="mt-2">в разработке</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
