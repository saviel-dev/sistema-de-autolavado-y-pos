import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  IoSpeedometerOutline,
  IoCarSportOutline,
  IoLayersOutline,
  IoSwapHorizontalOutline,
  IoCashOutline,
  IoCalendarOutline,
  IoPeopleOutline,
  IoSettingsOutline,
  IoBarChartOutline,
  IoFlaskOutline,
  IoCubeOutline,
  IoChevronForwardOutline,
  IoIdCardOutline,
} from "react-icons/io5";

// Define menu structure with potential support for subgroups
type MenuItem = {
  title: string;
  url?: string;
  icon?: any;
  items?: {
    title: string;
    url: string;
    icon?: any;
  }[];
};

const menuStructure: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IoSpeedometerOutline,
  },
  {
    title: "Trabajadores",
    url: "/workers",
    icon: IoIdCardOutline,
  },
  {
    title: "Productos",
    icon: IoCubeOutline,
    items: [
      {
        title: "Inventario",
        url: "/inventory",
        icon: IoLayersOutline,
      },
      {
        title: "Insumos",
        url: "/consumables",
        icon: IoFlaskOutline,
      },
      {
        title: "Movimientos",
        url: "/movements",
        icon: IoSwapHorizontalOutline,
      }
    ]
  },
  {
    title: "Autolavado",
    icon: IoCarSportOutline,
    items: [
      {
        title: "Clientes",
        url: "/customers",
        icon: IoPeopleOutline,
      },
      {
        title: "Servicios",
        url: "/services",
        icon: IoCarSportOutline,
      },
      {
        title: "Pedidos",
        url: "/appointments",
        icon: IoCalendarOutline,
      }
    ]
  },
  {
    title: "POS",
    url: "/pos",
    icon: IoCashOutline,
  },
  {
    title: "Reportes",
    url: "/reports",
    icon: IoBarChartOutline,
  },
  {
    title: "Ajustes",
    url: "/settings",
    icon: IoSettingsOutline,
  },
];

import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/components/ui/sidebar";

export function AppSidebar() {
  const location = useLocation();
  const { isAdmin, user, profile } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const filteredItems = menuStructure.filter(item => {
    // Hide Settings and Workers for non-admins
    if ((item.title === "Ajustes" || item.title === "Trabajadores") && !isAdmin) {
        return false;
    }
    return true;
  });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-2 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <img 
            src="/img/logo.png" 
            alt="Logo" 
            className="h-8 w-8 object-contain"
          />
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-data-[collapsible=icon]:hidden">
            Autolavado Gochi
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => {
                const Icon = item.icon;
                
                // Special handling for collapsed state with subgroups:
                // Flatten the structure to show sublink icons directly
                if (item.items && isCollapsed) {
                  return item.items.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = location.pathname === subItem.url;
                    return (
                        <SidebarMenuItem key={subItem.title}>
                            <SidebarMenuButton asChild tooltip={subItem.title} isActive={isSubActive}>
                                <NavLink to={subItem.url} className={isSubActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}>
                                    {SubIcon && <SubIcon className="h-5 w-5" />}
                                    <span className="hidden">{subItem.title}</span>
                                </NavLink>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                  });
                }
                
                // Render Group (Collapsible) - Expanded State
                if (item.items) {
                     // Check if any child is active to default open
                    const isChildActive = item.items.some(child => location.pathname === child.url);
                    
                    return (
                        <Collapsible key={item.title} defaultOpen={isChildActive} className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip={item.title} className="w-full justify-between">
                                        <div className="flex items-center gap-2">
                                            {Icon && <Icon className="h-5 w-5" />}
                                            <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                                        </div>
                                        <IoChevronForwardOutline className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => {
                                            const SubIcon = subItem.icon;
                                            const isSubActive = location.pathname === subItem.url;
                                            return (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton asChild isActive={isSubActive}>
                                                        <NavLink to={subItem.url}>
                                                            {SubIcon && <SubIcon className="h-4 w-4 mr-2" />}
                                                            <span className="group-data-[collapsible=icon]:hidden">{subItem.title}</span>
                                                        </NavLink>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    );
                }

                // Render Single Item
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                      <NavLink to={item.url!} className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}>
                        {Icon && <Icon className="h-5 w-5" />}
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/20 group-data-[collapsible=icon]:!size-8 transition-all">
             {(profile?.nombre?.[0] || user?.email?.[0] || "U").toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden text-left">
            <span className="truncate text-sm font-bold text-foreground">
              {profile?.nombre || "Administrador"}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.email}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
