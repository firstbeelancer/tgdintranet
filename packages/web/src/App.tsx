import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuth, type AuthContextValue } from '@/hooks/useAuth';
import { SidebarLayout } from '@/components/SidebarLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import EmployeeContactsPage from '@/pages/EmployeeContactsPage';
import FormsPage from '@/pages/FormsPage';
import KnowledgeBasePage from '@/pages/KnowledgeBasePage';
import KnowledgePageView from '@/pages/KnowledgePageView';
import MarketingPage from '@/pages/MarketingPage';
import HRPage from '@/pages/HRPage';
import AdminPanel from '@/pages/AdminPanel';
import NotFound from '@/pages/NotFound';
import type { UserRole } from '@/api/client';

const ROLE_LEVEL: Record<UserRole, number> = { user: 1, marketer: 2, admin: 3 };

function Protected({ children, minRole = 'user' }: { children: ReactNode; minRole?: UserRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Проверяем сессию...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (ROLE_LEVEL[user.role] < ROLE_LEVEL[minRole]) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2 max-w-md">
          <h1 className="text-2xl font-bold">Доступ запрещён</h1>
          <p className="text-muted-foreground">
            Раздел доступен только роли <strong>{minRole}</strong> и выше. Вы вошли как <strong>{user.role}</strong>.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <Protected>
      <SidebarLayout>{children}</SidebarLayout>
    </Protected>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/employees" element={<Layout><EmployeeContactsPage /></Layout>} />
      <Route path="/forms" element={<Layout><FormsPage /></Layout>} />
      <Route path="/knowledge" element={<Layout><KnowledgeBasePage /></Layout>} />
      <Route path="/knowledge/:slug" element={<Layout><KnowledgePageView /></Layout>} />
      <Route path="/marketing" element={<Layout minRole="marketer"><MarketingPage /></Layout>} />
      <Route path="/hr" element={<Layout minRole="admin"><HRPage /></Layout>} />
      <Route path="/admin" element={<Layout minRole="admin"><AdminPanel /></Layout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
