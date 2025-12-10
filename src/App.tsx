import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Login from "./pages/Login";
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import Inventory from "./pages/Inventory";
import Movements from "./pages/Movements";
import POS from "./pages/POS";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BarcodeTestPanel from "./pages/BarcodeTestPanel";
import { ProductProvider } from "./contexts/ProductContext";
import { SalesProvider } from "./contexts/SalesContext";
import { MovementProvider } from "./contexts/MovementContext";
import { CustomerProvider } from "./contexts/CustomerContext";
import { ServiceProvider } from "@/contexts/ServiceContext";
import { OrderProvider } from "./contexts/OrderContext";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('configuracion').select('count').single();
        if (error && error.code !== 'PGRST116') { // PGRST116 es "no rows", que cuenta como conexión exitosa
           console.error('Error de conexión Supabase:', error);
           toast.error("Error conectando con Supabase: " + error.message);
        } else {
           console.log('Conexión a Supabase exitosa');
           toast.success("Conexión a base de datos establecida correctamente");
        }
      } catch (err) {
        console.error('Error inesperado:', err);
      }
    };
    checkConnection();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProductProvider>
          <MovementProvider>
            <CustomerProvider>
              <ServiceProvider>
                <SalesProvider>
                  <OrderProvider>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      <BrowserRouter>
                        <Routes>
                          <Route path="/login" element={<Login />} />
                          <Route path="/" element={<Navigate to="/login" replace />} />
                          <Route element={<MainLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/pos" element={<POS />} />
                            <Route path="/services" element={<Services />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/movements" element={<Movements />} />
                            <Route path="/appointments" element={<Orders />} />
                            <Route path="/customers" element={<Customers />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/settings" element={<Settings />} />
                            {import.meta.env.DEV && (
                              <Route path="/barcode-test" element={<BarcodeTestPanel />} />
                            )}
                          </Route>
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </BrowserRouter>
                    </TooltipProvider>
                  </OrderProvider>
                </SalesProvider>
              </ServiceProvider>
            </CustomerProvider>
          </MovementProvider>
        </ProductProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
export default App;
