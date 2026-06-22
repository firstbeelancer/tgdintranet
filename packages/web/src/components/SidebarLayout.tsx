import { type ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { IntranetHeader } from './IntranetHeader';

export function SidebarLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <IntranetHeader />
        <main className="flex-1 p-6 lg:p-8 max-w-[1200px] w-full">{children}</main>
      </div>
    </div>
  );
}
