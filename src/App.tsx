import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Dashboard } from "./components/Dashboard";
import { ClientForm } from "./components/ClientForm";
import { ClientList } from "./components/ClientList";
import { ClientDetail } from "./components/ClientDetail";
import { EquipmentForm } from "./components/EquipmentForm";
import { EquipmentValidation } from "./components/EquipmentValidation";
import { StockManagement } from "./components/StockManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ajouter-client" element={<ClientForm />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/client/:clientId" element={<ClientDetail />} />
          <Route path="/remettre-equipement" element={<EquipmentForm />} />
          <Route path="/valider-equipement/:clientId/:equipmentIndex" element={<EquipmentValidation />} />
          <Route path="/stock" element={<StockManagement />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
