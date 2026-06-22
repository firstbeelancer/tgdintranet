import { Link } from 'react-router-dom';
import { Bell, Search, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function IntranetHeader() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
      <div className="flex h-16 items-center justify-between px-6 gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="lg:hidden flex items-center gap-2 font-semibold">
            <div className="h-8 w-8 rounded-md bg-welcome-gradient flex items-center justify-center text-white">
              <Building2 className="h-4 w-4" />
            </div>
            TGD
          </Link>
          <div className="hidden md:flex items-center gap-2 max-w-md flex-1">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Поиск по хабу..."
                className="w-full h-9 pl-9 pr-3 rounded-md border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 w-9 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground">
            <Bell className="h-4 w-4" />
          </button>
          {user && (
            <div className="hidden md:flex items-center gap-2 pl-2 border-l">
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                {user.displayName
                  .split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="text-sm leading-tight">
                <div className="font-medium">{user.displayName}</div>
                <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
