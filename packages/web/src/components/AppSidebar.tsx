import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  FileText,
  BookOpen,
  Megaphone,
  Briefcase,
  ShieldCheck,
  LogOut,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  minRole?: 'admin' | 'marketer' | 'user';
};

const NAV: NavItem[] = [
  { to: '/', label: 'Главная', icon: Home },
  { to: '/employees', label: 'Сотрудники', icon: Users },
  { to: '/forms', label: 'Документы', icon: FileText },
  { to: '/knowledge', label: 'База знаний', icon: BookOpen },
  { to: '/marketing', label: 'Маркетинг', icon: Megaphone, minRole: 'marketer' },
  { to: '/hr', label: 'HR', icon: Briefcase, minRole: 'admin' },
  { to: '/admin', label: 'Админ-панель', icon: ShieldCheck, minRole: 'admin' },
];

const ROLE_LEVEL = { user: 1, marketer: 2, admin: 3 } as const;

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const visibleNav = NAV.filter((item) => {
    if (!item.minRole) return true;
    if (!user) return false;
    return ROLE_LEVEL[user.role] >= ROLE_LEVEL[item.minRole];
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-card border-r">
      <div className="px-6 py-5 border-b">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md bg-welcome-gradient flex items-center justify-center text-white font-bold">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold leading-tight">TGD Intranet</div>
            <div className="text-xs text-muted-foreground">Корпоративный хаб</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t space-y-3">
        {user && (
          <div className="px-3 py-2">
            <div className="text-sm font-medium leading-tight">{user.displayName}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
            <div className="text-xs text-primary mt-1 uppercase tracking-wider font-semibold">{user.role}</div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </button>
      </div>
    </aside>
  );
}
