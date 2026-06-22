import {
  Calendar,
  Megaphone,
  FileText,
  BookOpen,
  Award,
  Users,
  Home,
  Settings,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { title: "Главная", url: "/", icon: Home },
  { title: "Календарь", url: "/calendar", icon: Calendar },
  { title: "Партнёры", url: "/partners", icon: Award },
  { title: "Маркетинг", url: "/marketing", icon: Megaphone },
  { title: "Бланки", url: "/forms", icon: FileText },
  { title: "База знаний", url: "/knowledge", icon: BookOpen },
  { title: "HR", url: "/hr", icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card z-40">
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.url === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.url) && item.url !== "#";

                const link = (
                  <NavLink
                    to={item.url}
                    end={item.url === "/"}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                    activeClassName="bg-primary/10 text-primary font-semibold"
                  >
                    <item.icon size={22} className="shrink-0" />
                    {!collapsed && (
                      <span className="text-base font-medium truncate">{item.title}</span>
                    )}
                  </NavLink>
                );

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right">{item.title}</TooltipContent>
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
