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
} from "@/components/ui/sidebar";
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
} from "react-icons/io5";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IoSpeedometerOutline,
  },
  {
    title: "POS",
    url: "/pos",
    icon: IoCashOutline,
  },
  {
    title: "Servicios",
    url: "/services",
    icon: IoCarSportOutline,
  },
  {
    title: "Inventario",
    url: "/inventory",
    icon: IoLayersOutline,
  },
  {
    title: "Movimientos",
    url: "/movements",
    icon: IoSwapHorizontalOutline,
  },
  {
    title: "Pedidos",
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
  {
    title: "Reportes",
    url: "/reports",
    icon: IoBarChartOutline,
  },
];

import { useAuth } from "@/contexts/AuthContext";

// ... (keep imports)

// ... (keep menuItems definition)

export function AppSidebar() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const filteredMenuItems = menuItems.filter(item => {
    // Hide Settings for non-admins
    if (item.title === "Configuración" && !isAdmin) {
        return false;
    }
    return true;
  });

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
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative overflow-hidden group ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-primary/10 hover:text-primary"
                        }`}
                      >
                        {({ isActive }) => (
                          <motion.div
                            className="flex items-center gap-3 w-full z-10"
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.title}</span>
                            {isActive && (
                              <motion.div
                                layoutId="active-pill"
                                className="absolute inset-0 bg-sidebar-accent opacity-100 -z-10 rounded-lg"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}
                          </motion.div>
                        )}
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
