import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import Inventory from "./pages/Inventory";
import Movements from "./pages/Movements";
import POS from "./pages/POS";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BarcodeTestPanel from "./pages/BarcodeTestPanel";
import { ProductProvider } from "./contexts/ProductContext";
import { MovementProvider } from "./contexts/MovementContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ProductProvider>
      <MovementProvider>
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
                <Route path="/settings" element={<Settings />} />
                {import.meta.env.DEV && (
                  <Route path="/barcode-test" element={<BarcodeTestPanel />} />
                )}
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </MovementProvider>
    </ProductProvider>
  </QueryClientProvider>
);

export default App;
