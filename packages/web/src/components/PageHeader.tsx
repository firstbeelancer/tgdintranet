import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

export function PageHeader({
  title,
  description,
  backTo,
  children,
}: {
  title: string;
  description?: string;
  backTo?: string;
  children?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          {backTo && (
            <Button variant="ghost" size="icon" onClick={() => navigate(backTo)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{title}</h1>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}
