import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { IoLogOutOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const MainLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
            <SidebarTrigger className="text-foreground" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <IoLogOutOutline className="h-5 w-5" />
              Cerrar Sesión
            </Button>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
