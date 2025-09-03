import { useState } from 'react';
import { NotificationsDashboard } from './NotificationsDashboard';
import { NotificationTemplates } from './NotificationTemplates';
import { NotificationHistory } from './NotificationHistory';
import { NotificationGuide } from './NotificationGuide';
import { ClientList } from './ClientList';

interface NotificationsAppProps {
  onSwitchApp: () => void;
}

type NotificationsRoute = 'dashboard' | 'templates' | 'history' | 'guide' | 'clients';

export function NotificationsApp({ onSwitchApp }: NotificationsAppProps) {
  const [currentRoute, setCurrentRoute] = useState<NotificationsRoute>('dashboard');

  const renderCurrentRoute = () => {
    switch (currentRoute) {
      case 'dashboard':
        return (
          <NotificationsDashboard 
            onSwitchApp={onSwitchApp}
            onNavigate={setCurrentRoute}
          />
        );
      case 'templates':
        return (
          <NotificationTemplates 
            onBack={() => setCurrentRoute('dashboard')}
          />
        );
      case 'history':
        return (
          <NotificationHistory 
            onBack={() => setCurrentRoute('dashboard')}
          />
        );
      case 'guide':
        return (
          <NotificationGuide 
            onBack={() => setCurrentRoute('dashboard')}
          />
        );
      case 'clients':
        return (
          <ClientList 
            onSwitchApp={onSwitchApp}
            onBack={() => setCurrentRoute('dashboard')}
          />
        );
      default:
        return (
          <NotificationsDashboard 
            onSwitchApp={onSwitchApp}
            onNavigate={setCurrentRoute}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderCurrentRoute()}
    </div>
  );
}