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
  SidebarHeader,
} from "@/components/ui/sidebar";
import { 
  IoSpeedometerOutline,
  IoCarSportOutline,
  IoCalendarOutline,
  IoPeopleOutline,
  IoSettingsOutline,
} from "react-icons/io5";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IoSpeedometerOutline,
  },
  {
    title: "Servicios",
    url: "/services",
    icon: IoCarSportOutline,
  },
  {
    title: "Citas",
    url: "/appointments",
    icon: IoCalendarOutline,
  },
  {
    title: "Clientes",
    url: "/customers",
    icon: IoPeopleOutline,
  },
  {
    title: "Configuración",
    url: "/settings",
    icon: IoSettingsOutline,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Autolavado Gochi
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-primary/10 hover:text-primary"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </NavLink>
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
