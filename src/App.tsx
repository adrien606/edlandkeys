import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSupabaseStore } from "./hooks/useSupabaseStore";
import { useAuth } from "./hooks/useAuth";
import { AuthPage } from "./pages/AuthPage";
import { UserManagement } from "./components/UserManagement";
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
import { InspectionHistory } from "./components/InspectionHistory";
import { InspectionDetail } from "./components/InspectionDetail";
import { BuildingManagement } from "./components/BuildingManagement";
import { NewInspection } from "./components/NewInspection";
import { InspectionForm } from "./components/InspectionForm";
import { InspectionSignature } from "./components/InspectionSignature";
import { NotificationsApp } from "./components/NotificationsApp";

const queryClient = new QueryClient();

const App = () => {
  const [currentApp, setCurrentApp] = useState<'equipment' | 'inspection' | 'notifications' | 'users' | null>(null);
  const { isAuthenticated, loading } = useAuth();
  const initialize = useSupabaseStore(state => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthPage onAuthSuccess={() => {}} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show app selection screen if authenticated
  if (currentApp === 'users') {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <UserManagement />
          <div className="fixed bottom-4 left-4">
            <button
              onClick={() => setCurrentApp(null)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retour aux applications
            </button>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show login screen (app selection) if authenticated but no app selected
  if (currentApp !== 'equipment' && currentApp !== 'inspection' && currentApp !== 'notifications') {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <LoginScreen 
            onLogin={(appType) => setCurrentApp(appType)}
            onUserManagement={() => setCurrentApp('users')}
          />
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
              <Route path="/" element={<Dashboard onSwitchApp={() => setCurrentApp('inspection')} />} />
              <Route path="/ajouter-client" element={<ClientForm onSwitchApp={() => setCurrentApp('inspection')} />} />
              <Route path="/clients" element={<ClientList onSwitchApp={() => setCurrentApp('inspection')} />} />
              <Route path="/client/:clientId" element={<ClientDetail onSwitchApp={() => setCurrentApp('inspection')} />} />
              <Route path="/remettre-equipement" element={<EquipmentForm onSwitchApp={() => setCurrentApp('inspection')} />} />
              <Route path="/valider-equipement/:clientId/:equipmentIndex" element={<EquipmentValidation onSwitchApp={() => setCurrentApp('inspection')} />} />
              <Route path="/stock" element={<StockManagement onSwitchApp={() => setCurrentApp('inspection')} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Notifications App
  if (currentApp === 'notifications') {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <NotificationsApp onSwitchApp={() => setCurrentApp(null)} />
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
        <InspectionApp onBackToApps={() => setCurrentApp(null)} onSwitchApp={() => setCurrentApp('equipment')} />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const InspectionApp = ({ onBackToApps, onSwitchApp }: { onBackToApps: () => void; onSwitchApp: () => void }) => {
  const [currentRoute, setCurrentRoute] = useState('dashboard');

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
  };

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <InspectionDashboard onNavigate={handleNavigate} onBackToApps={onBackToApps} onSwitchApp={onSwitchApp} />;
      case 'new-inspection':
        return <NewInspection onNavigate={handleNavigate} onBack={() => setCurrentRoute('dashboard')} onSwitchApp={onSwitchApp} />;
      case 'inspection-form':
        return <InspectionForm onNavigate={handleNavigate} onBack={() => setCurrentRoute('new-inspection')} onSwitchApp={onSwitchApp} />;
      case 'inspection-signature':
        return <InspectionSignature onNavigate={handleNavigate} onBack={() => setCurrentRoute('inspection-form')} onSwitchApp={onSwitchApp} />;
      case 'inspection-history':
        return <InspectionHistory onNavigate={handleNavigate} onBack={() => setCurrentRoute('dashboard')} onSwitchApp={onSwitchApp} />;
      case 'building-management':
        return <BuildingManagement onNavigate={handleNavigate} onBack={() => setCurrentRoute('new-inspection')} onSwitchApp={onSwitchApp} />;
      case 'clients':
        return <ClientList onSwitchApp={onSwitchApp} onBack={() => setCurrentRoute('dashboard')} />;
      default:
        // Handle inspection-detail routes
        if (currentRoute.startsWith('inspection-detail/')) {
          const inspectionId = currentRoute.replace('inspection-detail/', '');
          return <InspectionDetail inspectionId={inspectionId} onNavigate={handleNavigate} onBack={() => setCurrentRoute('dashboard')} onSwitchApp={onSwitchApp} />;
        }
        return <InspectionDashboard onNavigate={handleNavigate} onBackToApps={onBackToApps} onSwitchApp={onSwitchApp} />;
    }
  };

  return renderCurrentPage();
};

export default App;