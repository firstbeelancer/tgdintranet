import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl font-bold text-primary">404</div>
        <h1 className="text-2xl font-bold">Страница не найдена</h1>
        <p className="text-muted-foreground">
          Возможно, раздел переехал или ещё в разработке.
        </p>
        <Button asChild>
          <Link to="/">На главную</Link>
        </Button>
      </div>
    </div>
  );
}
