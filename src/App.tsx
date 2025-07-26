import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
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
import { LoginScreen } from "./components/LoginScreen";

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentApp, setCurrentApp] = useState<'equipment' | 'inspection'>('equipment');

  if (!isLoggedIn) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <LoginScreen onLogin={(appType) => {
            setCurrentApp(appType);
            setIsLoggedIn(true);
          }} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Equipment Management App
  if (currentApp === 'equipment') {
    return (
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Inspection App
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen bg-background p-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">États des Lieux</h1>
              <p className="text-muted-foreground">Application en développement</p>
            </div>
            <Button 
              onClick={() => {
                setCurrentApp('equipment');
              }}
              className="w-full"
            >
              Retour à Gestion Équipements
            </Button>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
