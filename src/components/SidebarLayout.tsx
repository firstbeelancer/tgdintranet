import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { IntranetHeader } from "@/components/IntranetHeader";
import { DataParticles } from "@/components/DataParticles";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="relative min-h-screen flex w-full bg-background mesh-bg">
        <DataParticles variant="light" />
        <div className="relative z-10 flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <IntranetHeader leftSlot={<SidebarTrigger className="mr-1" />} />
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
