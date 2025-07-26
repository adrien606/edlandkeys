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
import { InspectionDashboard } from "./components/InspectionDashboard";
import { NewInspection } from "./components/NewInspection";
import { InspectionForm } from "./components/InspectionForm";
import { InspectionSignature } from "./components/InspectionSignature";

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
        <InspectionApp onBackToApps={() => setIsLoggedIn(false)} />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const InspectionApp = ({ onBackToApps }: { onBackToApps: () => void }) => {
  const [currentRoute, setCurrentRoute] = useState('dashboard');

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
  };

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <InspectionDashboard onNavigate={handleNavigate} onBackToApps={onBackToApps} />;
      case 'new-inspection':
        return <NewInspection onNavigate={handleNavigate} onBack={() => setCurrentRoute('dashboard')} />;
      case 'inspection-form':
        return <InspectionForm onNavigate={handleNavigate} onBack={() => setCurrentRoute('new-inspection')} />;
      case 'inspection-signature':
        return <InspectionSignature onNavigate={handleNavigate} onBack={() => setCurrentRoute('inspection-form')} />;
      default:
        return <InspectionDashboard onNavigate={handleNavigate} onBackToApps={onBackToApps} />;
    }
  };

  return renderCurrentPage();
};

export default App;
